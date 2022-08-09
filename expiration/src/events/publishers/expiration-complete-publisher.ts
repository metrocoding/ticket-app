import {
    ExpirationCompleteEvent,
    Publisher,
    Subjects,
} from "@armineslami/ticketing-common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
