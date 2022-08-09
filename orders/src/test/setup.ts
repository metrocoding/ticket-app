import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { setGlobalSignup } from "./signup-handler";

let mongo: MongoMemoryServer;

// mock this file with file in __mocks__ directory
jest.mock("../events/nats-wrapper.ts");

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
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) await collection.deleteMany({});
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

setGlobalSignup();
