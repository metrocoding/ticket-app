import request from "supertest";

import { app } from "../../app";
import { Ticket } from "../../model/ticket";

const createTicket = async (title: string, price: number) => {
    const ticket = Ticket.build({
        title,
        price,
    });
    await ticket.save();
    return ticket;
};

it("Should s orders for an particular user", async () => {
    const ticketOne = await createTicket("title 1", 10);
    const ticketTwo = await createTicket("title 2", 20);
    const ticketThree = await createTicket("title 3", 30);

    const userOne = signup();
    const userTwo = signup();

    // user one first ticket
    await request(app)
        .post("/api/orders")
        .set("Cookie", userOne)
        .send({ ticketId: ticketOne.id })
        .expect(201);

    // user two other tickets
    const { body: orderOne } = await request(app)
        .post("/api/orders")
        .set("Cookie", userTwo)
        .send({ ticketId: ticketTwo.id })
        .expect(201);
    const { body: orderTwo } = await request(app)
        .post("/api/orders")
        .set("Cookie", userTwo)
        .send({ ticketId: ticketThree.id })
        .expect(201);

    // request to get orders for user #2
    const response = await request(app)
        .get("/api/orders")
        .set("Cookie", userTwo)
        .expect(200);

    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(orderOne.id);
    expect(response.body[1].id).toEqual(orderTwo.id);
    expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
    expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});
