import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { natsWrapper } from "./events/nats-wrapper";

const start = async () => {
    if (!process.env.NATS_URL) throw new Error("env NATS_URL is not defined");
    if (!process.env.REDIS_HOST)
        throw new Error("env REDIS_HOST is not defined");
    if (!process.env.NATS_CLUSTER_ID)
        throw new Error("env NATS_CLUSTER_ID is not defined");
    if (!process.env.NATS_CLIENT_ID)
        throw new Error("env NATS_CLIENT_ID is not defined");

    // start NATS server
    try {
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            process.env.NATS_URL
        );
        natsWrapper.client.on("close", () => {
            console.log("❌ NATS connection closed");
            process.exit();
        });
        process.on("SIGINT", () => natsWrapper.client.close());
        process.on("SIGTERM", () => natsWrapper.client.close());
    } catch (err) {
        console.log("Error connecting to NATS server", err);
    }

    new OrderCreatedListener(natsWrapper.client).listen();
};

start();
