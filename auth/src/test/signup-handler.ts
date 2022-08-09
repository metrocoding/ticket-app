import request from "supertest";
import { app } from "../app";

// blobal signup function
declare global {
    function signup(): Promise<string[]>;
}

export const setGlobalSignup = () => {
    global.signup = async () => {
        const email = "test@test.com";
        const password = "12345678";
        const response = await request(app)
            .post("/api/users/signup")
            .send({ email, password })
            .expect(201);

        return response.get("Set-Cookie");
    };
};
