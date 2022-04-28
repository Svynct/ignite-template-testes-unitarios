import request from "supertest";
import { Connection } from "typeorm";
import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

import createConnection from "../../../../database/index";
import { app } from "../../../../app";

let connection: Connection;

describe("Create User Controller", () => {
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
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users")
      .send({
        name: "new_user",
        email: "newuser@finapi.com.br",
        password: "password"
      })

    expect(response.status).toBe(201);
  })

  it("should not be able to create an user if the email is already taken", async () => {
    const response = await request(app).post("/api/v1/users")
      .send({
        name: "new_user",
        email: "newuser@finapi.com.br",
        password: "password"
      })

    expect(response.status).toBe(400);
  })
})
