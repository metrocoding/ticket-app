import {
    Listener,
    OrderCreatedEvent,
    Subjects,
} from "@armineslami/ticketing-common";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;
    onMessage = async (data: OrderCreatedEvent["data"], msg: Message) => {
        // calculate delay base on ticket expire time
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

        // add job to expiration queue
        await expirationQueue.add({ orderId: data.id }, { delay });
        msg.ack();
    };
}
