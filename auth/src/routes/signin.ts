import {
    BadRequestError,
    validateRequest,
} from "@armineslami/ticketing-common";
import express, { Response, Request } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { Password } from "../utils/password";
import { User } from "../models/user";

const router = express.Router();

const requestValidatorSchema = [
    body("email").isEmail().withMessage("Email is not valid"),
    body("password")
        .trim()
        .notEmpty()
        .isLength({ min: 4, max: 20 })
        .withMessage("Password must be between 4 and 20 characters long"),
];

// route action ----------------------------------------------------------------
router.post(
    "/api/users/signin",
    requestValidatorSchema,
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (!existingUser) throw new BadRequestError("Please signup first");

        const isPasswordMatch = await Password.compare(
            existingUser.password,
            password
        );
        if (!isPasswordMatch) throw new BadRequestError("Invalid credentials");

        // generate JWT
        const userJwt = jwt.sign(
            { id: existingUser._id, email: existingUser.email },
            process.env.JWT_KEY!
        );

        // store it on session object
        req.session = { jwt: userJwt };

        res.status(200).send(existingUser);
    }
);

export { router as signinRouter };
