import { NotFoundError, requireAuth } from "@armineslami/ticketing-common";
import express, { Request, Response } from "express";
import { Order } from "../model/order";

const router = express.Router();

router.get("/api/orders/", requireAuth, async (req: Request, res: Response) => {
    const orders = await Order.find({ userId: req.currentUser!.id }).populate(
        "ticket"
    );
    if (!orders) throw new NotFoundError();

    res.send(orders);
});

export { router as indexOrderRouter };
