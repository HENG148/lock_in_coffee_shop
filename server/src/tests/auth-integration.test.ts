import { describe, expect, it } from "vitest";
import { App } from "../app.js";
import request from 'supertest'

const app = App();

describe("POST /api/v1/auth/register", () => {
  it("return 201 and tokens for a valid new registration", async () => {
    const email = `test-${Date.now()}@shop.com`;
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        fullName: "Test User",
        email,
        password: "Password123"
      });
    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe("cashier");
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("return 400 for a weak password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        fullName: "Test User",
        email: "weak@shop.com",
        password: "short"
      });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("return 409 when regisering a duplicate email", async () => {
    const email = `dup-${Date.now()}@shop.com`;
    await request(app)
      .post("/api/v1/auth/register")
      .send({
        fullName: "First",
        email,
        password: "Password123"
      });

    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        fullName: "Second",
        email,
        password: "Password123"
      });
    expect(res.status).toBe(409);
  })
})

describe("POST /api/v1/auth/login", () => {
  it("return 401 for wrong credientials without revealing which field was wrong", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "nobody@shop.com", password: "whatever123" });
    expect(res.status).toBe(401)
    expect(res.body.error.message).toBe("Invalid email or password");
  })
});

describe("Protected routes require a valid access token", () => {
  it("rejects request with no Authorization header", async () => {
    const res = await request(app).get("/api/v1/users");
    expect([401, 404]).toContain(res.status); // 404 until Module 2 adds the route
  })
})