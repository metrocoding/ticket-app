import {
    NotAuthorizedError,
    NotFoundError,
    OrderStatus,
    requireAuth,
} from "@armineslami/ticketing-common";
import express, { Request, Response } from "express";
import { natsWrapper } from "../events/nats-wrapper";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { Order } from "../model/order";

const router = express.Router();

router.delete(
    "/api/orders/:orderId",
    requireAuth,
    async (req: Request, res: Response) => {
        // find order
        const order = await Order.findById(req.params.orderId).populate(
            "ticket"
        );
        if (!order) throw new NotFoundError();
        if (order.userId !== req.currentUser!.id)
            throw new NotAuthorizedError();

        // cancel the order
        order.status = OrderStatus.Cancelled;
        await order.save();

        // * publish order cancelled event * //
        await new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            ticket: { id: order.ticket.id },
        });

        res.status(204).send(order);
    }
);

export { router as deleteOrderRouter };
