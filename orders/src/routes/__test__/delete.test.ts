import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../model/ticket";
import { OrderStatus } from "@armineslami/ticketing-common";
import { Order } from "../../model/order";
import { natsWrapper } from "../../events/nats-wrapper";

it("Should return 404 if the order is not found", async () => {
    const user = signup();
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .delete(`/api/orders/${id}`)
        .set("Cookie", user)
        .send()
        .expect(404);
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
        .delete(`/api/orders/${order.id}`)
        .set("Cookie", userTwo)
        .send()
        .expect(401);
});

it("Should delete order successfully", async () => {
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

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set("Cookie", user)
        .send()
        .expect(204);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("Should emits an order cancelled event", async () => {
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

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set("Cookie", user)
        .send()
        .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
