import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("should be able to create a new user", async () => {
    const newUser = await createUserUseCase.execute({
      email: "mock@email.com",
      name: "mock name",
      password: "123456"
    });

    expect(newUser).toHaveProperty("id");
  })

  it("should not be able to create an user with existing email", () => {
    expect(async () => {
      await createUserUseCase.execute({
        email: "mock@email.com",
        name: "mock name",
        password: "123456"
      });

      await createUserUseCase.execute({
        email: "mock@email.com",
        name: "mock name",
        password: "123456"
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  })
})
