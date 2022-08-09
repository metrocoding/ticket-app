import {
    PaymentCreatedEvent,
    Publisher,
    Subjects,
} from "@armineslami/ticketing-common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
