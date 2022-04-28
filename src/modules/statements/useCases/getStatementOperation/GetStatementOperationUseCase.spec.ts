import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  })

  it("should be able to get statement operation", async () => {
    const user = await inMemoryUsersRepository.create({
      email: "mock@email.com",
      name: "mock name",
      password: "123456"
    })

    const statement = await inMemoryStatementsRepository.create({
      user_id: user.id,
      amount: 100,
      description: "descripion",
      type: OperationType.DEPOSIT
    })

    const statementOperation = await getStatementOperationUseCase.execute({ user_id: user.id, statement_id: statement.id });

    expect(statementOperation).toHaveProperty("id");
    expect(statementOperation).toEqual(statement);
  })

  it("should not be able to get statement operation of nonexistent user", () => {
    expect(async () => {
      const statement = await inMemoryStatementsRepository.create({
        user_id: "user_id",
        amount: 100,
        description: "descripion",
        type: OperationType.DEPOSIT
      })

      await getStatementOperationUseCase.execute({ user_id: "user_id", statement_id: statement.id });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it("should not be able to get statement operation of nonexistent statement", () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        email: "mock@email.com",
        name: "mock name",
        password: "123456"
      })

      await getStatementOperationUseCase.execute({ user_id: user.id, statement_id: "statement_id" });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})
