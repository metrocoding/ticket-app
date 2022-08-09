import request from "supertest";
import { app } from "../../app";

it("Should return 201 on successful signup", async () => {
    return request(app)
        .post("/api/users/signup")
        .send({ email: "test@test.com", password: "12345678" })
        .expect(201);
});

it("Should return 400 with an invalid email", async () => {
    return request(app)
        .post("/api/users/signup")
        .send({ email: "test@test", password: "12345678" })
        .expect(400);
});

it("Should return 400 with short password", async () => {
    return request(app)
        .post("/api/users/signup")
        .send({ email: "test@test.com", password: "123" })
        .expect(400);
});

it("Should return 400 with missing email or password", async () => {
    await request(app)
        .post("/api/users/signup")
        .send({ email: "test@test.com" })
        .expect(400);

    await request(app)
        .post("/api/users/signup")
        .send({ password: "12345678" })
        .expect(400);
});

it("Should disallowedd duplicate email", async () => {
    await request(app)
        .post("/api/users/signup")
        .send({ email: "test@test.com", password: "12345678" })
        .expect(201);

    await request(app)
        .post("/api/users/signup")
        .send({ email: "test@test.com", password: "12345678" })
        .expect(400);
});

it("Should set cookie after successful signup", async () => {
    const response = await request(app)
        .post("/api/users/signup")
        .send({ email: "test@test.com", password: "12345678" })
        .expect(201);

    expect(response.get("Set-Cookie")).toBeDefined();
});
