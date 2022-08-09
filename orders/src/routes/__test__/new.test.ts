import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../model/ticket";
// import real nats-wrapper.ts then jest replace it with file in __mock__
import { natsWrapper } from "../../events/nats-wrapper";
import { Order } from "../../model/order";
import { OrderStatus } from "@armineslami/ticketing-common";

it("Should listen to /api/orders for post request", async () => {
    const response = await request(app).post("/api/orders").send({});
    expect(response.status).not.toEqual(404);
});

it("Should not be accessed if the user is not signed in", async () => {
    await request(app).post("/api/orders").send({}).expect(401);
});

it("Should be accessed if the user is signed in", async () => {
    const response = await request(app)
        .post("/api/orders")
        .set("Cookie", signup())
        .send({});
    expect(response.status).not.toBe(401);
});

it("Should returns error if ticketId is not provided", async () => {
    await request(app)
        .post("/api/orders")
        .set("Cookie", signup())
        .send({ ticketId: "notmongooseid" })
        .expect(400);

    await request(app)
        .post("/api/orders")
        .set("Cookie", signup())
        .send({})
        .expect(400);
});

it("Should return error if ticket does not exist", async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .post("/api/orders")
        .set("Cookie", signup())
        .send({ ticketId })
        .expect(404);
});

it("Should return error if ticket already reserved", async () => {
    const ticket = Ticket.build({ price: 10, title: "Concert" });
    await ticket.save();

    const order = Order.build({
        ticket,
        userId: "some id",
        status: OrderStatus.Created,
        expiresAt: new Date(),
    });
    await order.save();

    await request(app)
        .post("/api/orders")
        .set("Cookie", signup())
        .send({ ticketId: ticket.id })
        .expect(400);
});

it("Should reserve a ticket", async () => {
    const ticket = Ticket.build({ price: 10, title: "Concert" });
    await ticket.save();

    await request(app)
        .post("/api/orders")
        .set("Cookie", signup())
        .send({ ticketId: ticket.id })
        .expect(201);
});

it("Should emit order created event", async () => {
    const ticket = Ticket.build({ price: 10, title: "Concert" });
    await ticket.save();

    await request(app)
        .post("/api/orders")
        .set("Cookie", signup())
        .send({ ticketId: ticket.id })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
