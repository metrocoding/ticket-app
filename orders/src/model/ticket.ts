import { OrderStatus } from "@armineslami/ticketing-common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { Document, Model, model, Schema } from "mongoose";
import { Order } from "./order";

//
interface TicketAttrs {
    id: string;
    title: string;
    price: number;
}

//
interface TicketModel extends Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
    findPreviousVersion(event: {
        id: string;
        version: number;
    }): Promise<TicketDoc | null>;
}

//
export interface TicketDoc extends Document {
    title: string;
    price: number;
    version: number;
    isReserved(): Promise<boolean>;
}

const ticketSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        toJSON: {
            transform(_doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            },
        },
    }
);

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) =>
    new Ticket({ _id: attrs.id, price: attrs.price, title: attrs.title });
ticketSchema.statics.findPreviousVersion = (event: {
    id: string;
    version: number;
}) => {
    return Ticket.findOne({ _id: event.id, version: event.version - 1 });
};

// use function insteadof arrow function so this. refers to ticket document
ticketSchema.methods.isReserved = async function () {
    const existingOrder = await Order.findOne({
        // @ts-ignore
        ticket: this,
        status: { $ne: OrderStatus.Cancelled },
    });

    return !!existingOrder;
};

const Ticket = model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };
