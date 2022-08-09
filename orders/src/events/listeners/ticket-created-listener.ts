import {
    Listener,
    Subjects,
    TicketCreatedEvent,
} from "@armineslami/ticketing-common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "../../config/config";
import { Ticket } from "../../model/ticket";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
    readonly queueGroupName = queueGroupName;
    onMessage = async (data: TicketCreatedEvent["data"], msg: Message) => {
        // create and save ticket
        const { id, title, price } = data;

        const ticket = Ticket.build({ id, title, price });
        await ticket.save();

        msg.ack();
    };
}
