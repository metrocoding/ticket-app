import {
    Listener,
    Subjects,
    TicketUpdatedEvent,
} from "@armineslami/ticketing-common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "../../config/config";
import { Ticket } from "../../model/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    readonly queueGroupName = queueGroupName;
    onMessage = async (data: TicketUpdatedEvent["data"], msg: Message) => {
        // find and update ticket
        const { title, price } = data;
        const ticket = await Ticket.findPreviousVersion(data);
        if (!ticket) throw new Error("Ticket not found");

        ticket.set({ title, price });
        await ticket.save();

        msg.ack();
    };
}
