import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// blobal signup function
declare global {
    function signup(): string[];
}

export const setGlobalSignup = () => {
    global.signup = () => {
        const payload = {
            id: new mongoose.Types.ObjectId().toHexString(),
            email: "test@test.com",
        };

        const token = jwt.sign(payload, process.env.JWT_KEY!);
        const sessionJson = JSON.stringify({ jwt: token });

        // conver string to base64
        const base64 = Buffer.from(sessionJson).toString("base64");
        return [`express:sess=${base64}`];
    };
};
