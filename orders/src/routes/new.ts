import {
    BadRequestError,
    NotFoundError,
    OrderStatus,
    requireAuth,
    validateRequest,
} from "@armineslami/ticketing-common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import { EXPIRATION_SECONDS } from "../config/config";
import { natsWrapper } from "../events/nats-wrapper";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { Order } from "../model/order";
import { Ticket } from "../model/ticket";

const router = express.Router();

const requestValidatorSchema = [
    body("ticketId")
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage("TicketId must provided"),
];

router.post(
    "/api/orders/",
    requireAuth,
    requestValidatorSchema,
    validateRequest,
    async (req: Request, res: Response) => {
        const { ticketId } = req.body;

        // find ticket
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) throw new NotFoundError();

        // find out if the ticket is reserved or not
        const isReserved = await ticket.isReserved();
        if (isReserved) throw new BadRequestError("Ticket is already reserved");

        // calculate order expiration time
        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_SECONDS);

        // build order and save it
        const order = Order.build({
            expiresAt: expiration,
            status: OrderStatus.Created,
            ticket,
            userId: req.currentUser!.id,
        });
        await order.save();

        // * publish order created event * //
        new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            status: order.status,
            expiresAt: order.expiresAt.toISOString(),
            userId: order.userId,
            version: order.version,
            ticket: {
                id: ticket.id,
                price: ticket.price,
            },
        });

        res.status(201).send(order);
    }
);

export { router as createOrderRouter };
