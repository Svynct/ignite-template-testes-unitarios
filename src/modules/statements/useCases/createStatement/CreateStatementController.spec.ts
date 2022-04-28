import request from "supertest";
import { Connection } from "typeorm";
import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

import createConnection from "../../../../database/index";
import { app } from "../../../../app";

let connection: Connection;
let token: string;

describe("Create Statement Controller", () => {
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

    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "admin"
      })

    token = responseToken.body.token;
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to deposit an amount", async () => {
    const response = await request(app).post("/api/v1/statements/deposit").send({
      amount: 200.00,
      description: "Statement Supertest"
    }).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(201);
  })

  it("should be able to withdraw an amount", async () => {
    await request(app).post("/api/v1/statements/deposit").send({
      amount: 200.00,
      description: "Statement Supertest"
    }).set({
      Authorization: `Bearer ${token}`
    })

    const response = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 200.00,
      description: "Statement Supertest"
    }).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(201);
  })

  it("should not be able to withdraw an amount higher than the user funds", async () => {
    const response = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 999.99,
      description: "Statement Supertest"
    }).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(400);
  })
})
