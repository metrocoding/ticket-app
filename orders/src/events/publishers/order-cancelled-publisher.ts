import {
    Publisher,
    Subjects,
    OrderCancelledEvent,
} from "@armineslami/ticketing-common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
