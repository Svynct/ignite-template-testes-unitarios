import request from "supertest";
import { Connection } from "typeorm";
import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

import createConnection from "../../../../database/index";
import { app } from "../../../../app";

let connection: Connection;

describe("Authenticate User Controller", () => {
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

  it("should be able to authenticate user", async () => {
    const response = await request(app).post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "admin"
      })

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  })

  it("should not be able to authenticate with a nonexistent email", async () => {
    const response = await request(app).post("/api/v1/sessions")
      .send({
        email: "nonexistent_email@finapi.com.br",
        password: "admin"
      })

    expect(response.status).toBe(401);
  })

  it("should not be able to authenticate with an incorrect password", async () => {
    const response = await request(app).post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "incorrect_password"
      })

    expect(response.status).toBe(401);
  })
})
