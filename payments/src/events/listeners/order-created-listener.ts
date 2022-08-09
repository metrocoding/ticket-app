import {
    Listener,
    OrderCreatedEvent,
    Subjects,
} from "@armineslami/ticketing-common";
import { Message } from "node-nats-streaming";
import { Order } from "../../model/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;
    onMessage = async (data: OrderCreatedEvent["data"], msg: Message) => {
        const order = Order.build({
            id: data.id,
            userId: data.userId,
            version: data.version,
            status: data.status,
            price: data.ticket.price,
        });
        await order.save();

        msg.ack();
    };
}
