import {
    Listener,
    OrderStatus,
    PaymentCreatedEvent,
    Subjects,
} from "@armineslami/ticketing-common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "../../config/config";
import { Order } from "../../model/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
    queueGroupName = queueGroupName;
    onMessage = async (data: PaymentCreatedEvent["data"], msg: Message) => {
        const order = await Order.findById(data.orderId);
        if (!order) throw new Error("order not found");

        order.set({ status: OrderStatus.Complete });
        await order.save();

        // ? publish order updated event if neede no need for this app * //

        msg.ack();
    };
}
