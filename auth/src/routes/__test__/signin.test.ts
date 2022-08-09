import request from "supertest";
import { app } from "../../app";

it("Should return 400 when try to signin with email that is not registered", async () => {
    return request(app)
        .post("/api/users/signin")
        .send({ email: "test@test.com", password: "12345678" })
        .expect(400);
});

it("Should return 400 when password is wrong", async () => {
    await request(app)
        .post("/api/users/signup")
        .send({ email: "test@test.com", password: "12345678" });

    await request(app)
        .post("/api/users/signin")
        .send({ email: "test@test.com", password: "aaaaaa" })
        .expect(400);
});

it("Should return 200 after successful signin and get cookie in header", async () => {
    await request(app)
        .post("/api/users/signup")
        .send({ email: "test@test.com", password: "12345678" })
        .expect(201);

    const response = await request(app)
        .post("/api/users/signin")
        .send({ email: "test@test.com", password: "12345678" })
        .expect(200);
    expect(response.get("Set-Cookie")).toBeDefined();
});
