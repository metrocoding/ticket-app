import { requireAuth, validateRequest } from "@armineslami/ticketing-common";
import express, { Request, Response } from "express";
import { body } from "express-validator";

import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
import { natsWrapper } from "../events/nats-wrapper";
import { Ticket } from "../model/ticket";

const router = express.Router();

const requestValidatorSchema = [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
        .isFloat({ gt: 0 })
        .withMessage("Price must be greater than 0"),
];

router.post(
    "/api/tickets",
    requireAuth,
    requestValidatorSchema,
    validateRequest,
    async (req: Request, res: Response) => {
        const { title, price } = req.body;
        const ticket = Ticket.build({
            title,
            price,
            userId: req.currentUser!.id,
        });
        await ticket.save();

        // * publish ticket created event * //
        await new TicketCreatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
        });

        res.status(201).send(ticket);
    }
);

export { router as createTicketRouter };
