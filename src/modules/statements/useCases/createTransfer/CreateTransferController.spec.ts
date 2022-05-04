import request from "supertest";
import { Connection } from "typeorm";
import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

import createConnection from "../../../../database/index";
import { app } from "../../../../app";

let connection: Connection;
let token: string;
let receiver_id: string;

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

    const id_receiver = uuidV4();
    const password_receiver = await hash("receiver", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at)
        VALUES('${id_receiver}', 'receiver', 'receiver@finapi.com.br', '${password_receiver}', 'now()')
      `
    );

    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "admin"
      })

    token = responseToken.body.token;
    receiver_id = id_receiver;
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to transfer an amount", async () => {
    await request(app).post("/api/v1/statements/deposit").send({
      amount: 200.00,
      description: "Statement Supertest"
    }).set({
      Authorization: `Bearer ${token}`
    })

    const response = await request(app).post(`/api/v1/statements/transfers/${receiver_id}`).send({
      amount: 100.00,
      description: "Transferência de valor"
    }).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("sender_id");
    expect(response.body.type).toBe("transfer");
  })

  it("should not be able to transfer an amount if receiver doesnt exists", async () => {
    const nonexistent_id = uuidV4();

    const response = await request(app).post(`/api/v1/statements/transfers/${nonexistent_id}`).send({
      amount: 100.00,
      description: "Transferência de valor"
    }).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found");
  })

  it("should not be able to transfer an amount if sender doesnt have enough funds", async () => {
    const response = await request(app).post(`/api/v1/statements/transfers/${receiver_id}`).send({
      amount: 500.00,
      description: "Transferência de valor"
    }).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Insufficient funds");
  })
})
