import {
    Listener,
    OrderCancelledEvent,
    OrderStatus,
    Subjects,
} from "@armineslami/ticketing-common";
import { Message } from "node-nats-streaming";
import { Order } from "../../model/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;
    onMessage = async (data: OrderCancelledEvent["data"], msg: Message) => {
        const order = await Order.findOne({
            _id: data.id,
            version: data.version - 1,
        });
        if (!order) throw new Error("order not found");

        order.set({ status: OrderStatus.Cancelled });
        await order.save();

        msg.ack();
    };
}
