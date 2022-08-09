import request from "supertest";

import { app } from "../../app";

const createTicket = (title: string, price: number) => {
    return request(app)
        .post("/api/tickets")
        .set("Cookie", signup())
        .send({ title, price });
};

it("Should fetch a list of tickets", async () => {
    await createTicket("title 1", 10);
    await createTicket("title 2", 20);
    await createTicket("title 3", 30);

    const response = await request(app)
        .get("/api/tickets")
        .set("Cookie", signup())
        .send()
        .expect(200);

    expect(response.body.length).toEqual(3);
});
