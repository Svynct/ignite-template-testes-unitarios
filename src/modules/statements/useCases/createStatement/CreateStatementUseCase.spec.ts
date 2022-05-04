import "reflect-metadata";

import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  })

  it("should be able to create a new statement", async () => {
    const user = await inMemoryUsersRepository.create({
      email: "mock@email.com",
      name: "mock name",
      password: "123456"
    })

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      amount: 100,
      description: "mock description",
      type: OperationType.DEPOSIT
    })

    expect(statement).toHaveProperty("id");
  })

  it("should not be able to create a new statement for a nonexistent user", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "user.id",
        amount: 100,
        description: "mock description",
        type: OperationType.DEPOSIT
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it("should not be able to create a new withdraw when user doesnt have enough funds", () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        email: "mock@email.com",
        name: "mock name",
        password: "123456"
      })

      await createStatementUseCase.execute({
        user_id: user.id,
        amount: 999,
        description: "mock description",
        type: OperationType.WITHDRAW
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})
