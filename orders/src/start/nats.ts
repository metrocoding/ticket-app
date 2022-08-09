import { ExpirationCompleteListener } from "../events/listeners/expiration-complete-listener";
import { TicketCreatedListener } from "../events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "../events/listeners/ticket-updated-listener";
import { natsWrapper } from "../events/nats-wrapper";

export const connectToNats = async () => {
    // check environment variables
    if (!process.env.JWT_KEY) throw new Error("env JWT_KEY is not defined");
    if (!process.env.NATS_URL) throw new Error("env NATS_URL is not defined");
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

        // ? Listening to incoming events ? //
        new TicketCreatedListener(natsWrapper.client).listen();
        new TicketUpdatedListener(natsWrapper.client).listen();
        new ExpirationCompleteListener(natsWrapper.client).listen();
    } catch (err) {
        console.log("Error connecting to NATS server", err);
    }
};
