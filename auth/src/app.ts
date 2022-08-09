import { errorHandler, NotFoundError } from "@armineslami/ticketing-common";
import express from "express";
import cookieSession from "cookie-session";
import { json } from "body-parser";
import "express-async-errors";

import { currentUserRouter } from "./routes/current-user";
import { signoutRouter } from "./routes/signout";
import { signinRouter } from "./routes/signin";
import { signupRouter } from "./routes/signup";

const app = express();
app.set("trust proxy", true);

app.use(json());
app.use(
    cookieSession({ signed: false, secure: process.env.NODE_ENV !== "test" })
);

// register routes
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

// error handler
app.all("*", async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
