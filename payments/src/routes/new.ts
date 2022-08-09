import {
    BadRequestError,
    NotAuthorizedError,
    NotFoundError,
    OrderStatus,
    requireAuth,
    validateRequest,
} from "@armineslami/ticketing-common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { natsWrapper } from "../events/nats-wrapper";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";

import { Order } from "../model/order";
import { Payment } from "../model/payment";
import { stripe } from "../start/stripe";

const router = express.Router();

const requestValidatorSchema = [
    body("token").not().isEmpty().withMessage("Token is required"),
    body("orderId")
        .not()
        .isEmpty()
        .withMessage("OrderId must be greater than 0"),
];

router.post(
    "/api/payments",
    requireAuth,
    requestValidatorSchema,
    validateRequest,
    async (req: Request, res: Response) => {
        const { token, orderId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) throw new NotFoundError();

        if (order.userId !== req.currentUser!.id)
            throw new NotAuthorizedError();
        if (order.status === OrderStatus.Cancelled)
            throw new BadRequestError("can't pay for cancelled order");

        // create charge
        const charge = await stripe.charges.create({
            currency: "usd",
            amount: order.price * 100,
            source: token,
        });

        const payment = Payment.build({
            orderId: order.id,
            stripeId: charge.id,
        });
        await payment.save();

        // * publish payment created event * //
        await new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId,
        });

        res.status(201).send({ id: payment.id });
    }
);

export { router as createChargeRouter };
