import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { setGlobalSignup } from "./signup-handler";

let mongo: MongoMemoryServer;

beforeAll(async () => {
    process.env.JWT_KEY = "testkey";

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    });
});

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) await collection.deleteMany({});
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

setGlobalSignup();
