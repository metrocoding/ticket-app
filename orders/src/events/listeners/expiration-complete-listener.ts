import {
    ExpirationCompleteEvent,
    Listener,
    OrderStatus,
    Subjects,
} from "@armineslami/ticketing-common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "../../config/config";
import { Order } from "../../model/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    readonly subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    readonly queueGroupName = queueGroupName;
    onMessage = async (data: ExpirationCompleteEvent["data"], msg: Message) => {
        // find order
        const order = await Order.findById(data.orderId);
        if (!order) throw new Error("order not found");
        if (order.status === OrderStatus.Complete) return msg.ack();

        // update order status
        order.set({ status: OrderStatus.Cancelled });
        await order.save();

        // * publish order cancelled event * //
        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: { id: order.ticket.id },
        });

        msg.ack();
    };
}
