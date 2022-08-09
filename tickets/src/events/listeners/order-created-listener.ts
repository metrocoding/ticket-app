import {
    Listener,
    OrderCreatedEvent,
    Subjects,
} from "@armineslami/ticketing-common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../model/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;
    onMessage = async (data: OrderCreatedEvent["data"], msg: Message) => {
        const ticket = await Ticket.findById(data.ticket.id);
        if (!ticket) throw new Error("ticket not found");

        // lock ticket by adding orderId to it
        ticket.orderId = data.id;
        await ticket.save();

        // * publish ticket updated event * //
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId,
        });

        msg.ack();
    };
}
