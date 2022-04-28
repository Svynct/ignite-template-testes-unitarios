import request from "supertest";
import { Connection } from "typeorm";
import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

import createConnection from "../../../../database/index";
import { app } from "../../../../app";
import { User } from "../../entities/User";
import { sign } from "jsonwebtoken";

let connection: Connection;
let token: string;

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at)
        VALUES('${id}', 'admin', 'admin@finapi.com.br', '${password}', 'now()')
      `
    );

    const response = await request(app).post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "admin"
      })

    token = response.body.token;
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to show user profile", async () => {
    const response = await request(app).get("/api/v1/profile").send().set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  })

  it("should not be able to show a nonexistent user", async () => {
    const user = new User();

    user.email = "nonexistent_user@email.com";
    user.name = "nonexistent user";
    user.password = "123456";

    const nonExistentUserToken = sign({ user }, "secret", {
      subject: user.id,
      expiresIn: "1d",
    });

    const response = await request(app).get("/api/v1/profile").send().set({
      Authorization: `Bearer ${nonExistentUserToken}`
    })

    expect(response.status).toBe(404);
  })
})
