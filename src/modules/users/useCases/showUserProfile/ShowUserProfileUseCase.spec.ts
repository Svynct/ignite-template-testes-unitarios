import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  })

  it("should be able to show user profile", async () => {
    const user = await inMemoryUsersRepository.create({
      email: "mock@email.com",
      name: "mock name",
      password: "123456"
    })

    const userProfile = await showUserProfileUseCase.execute(user.id);

    expect(userProfile).toHaveProperty("id");
  })

  it("should not be able to show profile of a nonexistent user", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("user_id");
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  })
})
