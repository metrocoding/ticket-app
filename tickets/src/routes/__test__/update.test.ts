import request from "supertest";
import mongoose from "mongoose";
// import real nats-wrapper.ts then jest replace it with file in __mock__
import { natsWrapper } from "../../events/nats-wrapper";
import { app } from "../../app";

it("Should return 404 if provided id is not available", async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set("Cookie", signup())
        .send({ title: "title", price: 10.0 })
        .expect(404);
});

it("Should return 401 if user is not authenticated", async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({ title: "title", price: 10.0 })
        .expect(401);
});

it("Should return 401 if user does not own the ticket", async () => {
    const response = await request(app)
        .post(`/api/tickets/`)
        .set("Cookie", signup())
        .send({ title: "title", price: 10.0 });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", signup())
        .send({ title: "title 2", price: 20.0 })
        .expect(401);
});

it("Should return 400 if user provides invalid title-price", async () => {
    const cookie = signup();

    const response = await request(app)
        .post(`/api/tickets/`)
        .set("Cookie", cookie)
        .send({ title: "title 1", price: 10.0 });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({ title: "", price: 20.0 })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({ title: "title 2", price: -10 })
        .expect(400);
});

it("Should return 200 if user provides valid title-price", async () => {
    const cookie = signup();

    const response = await request(app)
        .post(`/api/tickets/`)
        .set("Cookie", cookie)
        .send({ title: "title 1", price: 10.0 });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({ title: "title 2", price: 20.0 })
        .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200);

    expect(ticketResponse.body.title).toEqual("title 2");
    expect(ticketResponse.body.price).toEqual(20.0);
});

it("Should publish an event after updating ticket", async () => {
    const cookie = signup();

    const response = await request(app)
        .post(`/api/tickets/`)
        .set("Cookie", cookie)
        .send({ title: "title 1", price: 10.0 });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({ title: "title 2", price: 20.0 })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
