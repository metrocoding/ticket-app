import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../model/ticket";

it("Should return 404 if the order is not found", async () => {
    const user = signup();
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .get(`/api/orders/${id}`)
        .set("Cookie", user)
        .send()
        .expect(404);
});

it("Should fetch the order", async () => {
    const ticket = Ticket.build({
        title: "concert",
        price: 10,
    });
    await ticket.save();

    const user = signup();

    const { body: order } = await request(app)
        .post("/api/orders")
        .set("Cookie", user)
        .send({ ticketId: ticket.id })
        .expect(201);

    const { body: fetchOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set("Cookie", user)
        .send()
        .expect(200);

    expect(fetchOrder.id).toEqual(order.id);
});

it("Should returns error when user try to fetch a order belongs to another user", async () => {
    const ticket = Ticket.build({
        title: "concert",
        price: 10,
    });
    await ticket.save();

    const user = signup();
    const userTwo = signup();

    const { body: order } = await request(app)
        .post("/api/orders")
        .set("Cookie", user)
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .get(`/api/orders/${order.id}`)
        .set("Cookie", userTwo)
        .send()
        .expect(401);
});
