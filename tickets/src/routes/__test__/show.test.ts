import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";

it("Should return 404 if the ticket is not found", async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it("Should return ticket if the ticket is found", async () => {
    const title = "concert";
    const price = 10.0;

    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", signup())
        .send({ title, price })
        .expect(201);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200);

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
});
