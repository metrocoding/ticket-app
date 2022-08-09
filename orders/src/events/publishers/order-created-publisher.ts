import {
    Publisher,
    Subjects,
    OrderCreatedEvent,
} from "@armineslami/ticketing-common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
