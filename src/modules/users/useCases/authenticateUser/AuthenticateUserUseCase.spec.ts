import { hash } from "bcryptjs";

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  })

  it("should be able to authenticate an existing user", async () => {
    await inMemoryUsersRepository.create({
      email: "mock@email.com",
      name: "mock_name",
      password: await hash("123456", 8)
    })

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: "mock@email.com",
      password: "123456"
    })

    expect(authenticatedUser).toHaveProperty("user");
    expect(authenticatedUser).toHaveProperty("token");
  })

  it("should not be able to authenticate user with incorrect password", () => {
    expect(async () => {
      await inMemoryUsersRepository.create({
        email: "mock@email.com",
        name: "mock_name",
        password: await hash("123456", 8)
      })

      await authenticateUserUseCase.execute({
        email: "mock@email.com",
        password: "654321"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  })

  it("should not be able to authenticate a nonexistent user", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "mock@email.com",
        password: "123456"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  })
})
