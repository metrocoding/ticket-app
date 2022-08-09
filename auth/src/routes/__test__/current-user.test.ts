import request from "supertest";
import { app } from "../../app";

it("Should response null if user is not authenticated", async () => {
    const response = await request(app)
        .get("/api/users/currentuser")
        .send()
        .expect(401);
    expect(response.body.currentUser).toEqual(undefined);
});

it("Should response with current user details if user is authenticated", async () => {
    const cookie = await signup();

    const response = await request(app)
        .get("/api/users/currentuser")
        .set("Cookie", cookie)
        .send()
        .expect(200);
    expect(response.body.currentUser.email).toEqual("test@test.com");
});
