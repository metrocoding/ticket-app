import request from "supertest";
import { app } from "../../app";
// import real nats-wrapper.ts then jest replace it with file in __mock__
import { natsWrapper } from "../../events/nats-wrapper";
import { Ticket } from "../../model/ticket";

it("Should listen to /api/tickets for post request", async () => {
    const response = await request(app).post("/api/tickets").send({});
    expect(response.status).not.toEqual(404);
});

it("Should not be accessed if the user is not signed in", async () => {
    await request(app).post("/api/tickets").send({}).expect(401);
});

it("Should be accessed if the user is signed in", async () => {
    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", signup())
        .send({});
    expect(response.status).not.toBe(401);
});

it("Should returns error if invalid title is provided", async () => {
    await request(app)
        .post("/api/tickets")
        .set("Cookie", signup())
        .send({ price: 10 })
        .expect(400);

    await request(app)
        .post("/api/tickets")
        .set("Cookie", signup())
        .send({ title: "", price: 10 })
        .expect(400);
});

it("Should returns error if invalid price is provided", async () => {
    await request(app)
        .post("/api/tickets")
        .set("Cookie", signup())
        .send({ title: "Concert", price: -10 })
        .expect(400);

    await request(app)
        .post("/api/tickets")
        .set("Cookie", signup())
        .send({ title: "Concert" })
        .expect(400);
});

it("Should create tickets with valid inputs", async () => {
    let ticketsCount = await Ticket.countDocuments();
    expect(ticketsCount).toEqual(0);

    await request(app)
        .post("/api/tickets")
        .set("Cookie", signup())
        .send({ title: "Concert", price: 10.0 })
        .expect(201);

    const ticket = await Ticket.findOne();
    expect(ticket?.title).toEqual("Concert");
});

it("Should publish an event after creating ticket", async () => {
    await request(app)
        .post("/api/tickets")
        .set("Cookie", signup())
        .send({ title: "Concert", price: 10.0 })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
