import {
    BadRequestError,
    NotAuthorizedError,
    NotFoundError,
    requireAuth,
    validateRequest,
} from "@armineslami/ticketing-common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { natsWrapper } from "../events/nats-wrapper";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { Ticket } from "../model/ticket";

const router = express.Router();

const requestValidatorSchema = [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
        .isFloat({ gt: 0 })
        .withMessage("Price must be greater than 0"),
];

router.put(
    "/api/tickets/:id",
    requireAuth,
    requestValidatorSchema,
    validateRequest,
    async (req: Request, res: Response) => {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) throw new NotFoundError();

        if (ticket.userId !== req.currentUser!.id)
            throw new NotAuthorizedError();
        // don't allow to update ticket if ticket is reserved
        if (ticket.orderId)
            throw new BadRequestError("can not update reserved ticket");

        const { title, price } = req.body;
        ticket.set({ title, price });

        await ticket.save();

        // * publish ticket updated event * //
        await new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
        });

        res.status(200).send(ticket);
    }
);

export { router as updateTicketRouter };
