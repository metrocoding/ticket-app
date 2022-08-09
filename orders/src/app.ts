import {
    currentUser,
    errorHandler,
    NotFoundError,
} from "@armineslami/ticketing-common";
import cookieSession from "cookie-session";
import { json } from "body-parser";
import express from "express";
import "express-async-errors";

import { deleteOrderRouter } from "./routes/delete";
import { indexOrderRouter } from "./routes/index";
import { createOrderRouter } from "./routes/new";
import { showOrderRouter } from "./routes/show";

const app = express();
app.set("trust proxy", true);

app.use(json());
app.use(
    cookieSession({ signed: false, secure: process.env.NODE_ENV !== "test" })
);
app.use(currentUser);

// register routes
app.use(deleteOrderRouter);
app.use(indexOrderRouter);
app.use(createOrderRouter);
app.use(showOrderRouter);

// error handler
app.all("*", async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
