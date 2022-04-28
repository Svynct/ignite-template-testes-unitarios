import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { GetBalanceError } from "./GetBalanceError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  })

  it("should be able to get user balance", async () => {
    const user = await inMemoryUsersRepository.create({
      email: "mock@email.com",
      name: "mock name",
      password: "123456"
    })

    const balance = await getBalanceUseCase.execute({ user_id: user.id });

    expect(balance).toHaveProperty("statement");
    expect(balance).toHaveProperty("balance");
  })

  it("should not be able to get balance of nonexistent user", () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "user.id" });
    }).rejects.toBeInstanceOf(GetBalanceError)
  })
})
