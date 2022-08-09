import {
    Listener,
    OrderCancelledEvent,
    Subjects,
} from "@armineslami/ticketing-common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../model/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;
    onMessage = async (data: OrderCancelledEvent["data"], msg: Message) => {
        const ticket = await Ticket.findById(data.ticket.id);
        if (!ticket) throw new Error("ticket not found");

        // lock ticket by adding orderId to it
        ticket.orderId = undefined;
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
