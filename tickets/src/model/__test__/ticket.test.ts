import { Ticket } from "../ticket";

it("Should implement optimistic concurrency control", async () => {
    // create ticket & save
    const ticket = Ticket.build({
        title: "concert",
        price: 10,
        userId: "123",
    });
    await ticket.save();

    // fetch ticket twice
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    // make two seprate updates in two instances
    firstInstance!.set({ price: 40 });
    secondInstance!.set({ title: "theater" });

    // save firstInstance
    await firstInstance!.save();

    // save secondInstance and get error
    try {
        await secondInstance!.save();
        throw new Error("Should not reach to this point");
    } catch (err) {
        return;
    }
});
