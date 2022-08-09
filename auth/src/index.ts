import mongoose from "mongoose";
import { app } from "./app";

// check environment variables
if (!process.env.JWT_KEY || !process.env.MONGO_URI)
    throw new Error("Check environment variables to be defined");

// start database then server
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
    .then(() => {
        console.log("✅ Connected to MongoDb");

        // running server
        app.listen(3000, () => console.log("✅ Listening on port 3000"));
    })
    .catch((err) => console.log(err));
