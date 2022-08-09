import { connectToMongodb } from "./start/database";
import { connectToNats } from "./start/nats";

const start = async () => {
    await connectToNats();
    connectToMongodb();
};

start();
