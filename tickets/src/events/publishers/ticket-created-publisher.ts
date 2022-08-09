import {
    Publisher,
    Subjects,
    TicketCreatedEvent,
} from "@armineslami/ticketing-common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
