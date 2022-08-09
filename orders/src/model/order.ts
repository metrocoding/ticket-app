import { OrderStatus } from "@armineslami/ticketing-common";
import { Document, Model, model, Schema } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { TicketDoc } from "./ticket";

//
interface OrderAttrs {
    status: OrderStatus;
    userId: string;
    expiresAt: Date;
    ticket: TicketDoc;
}

//
interface OrderModel extends Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
}

//
interface OrderDoc extends Document {
    status: OrderStatus;
    userId: string;
    expiresAt: Date;
    ticket: TicketDoc;
    version: number;
}

const orderSchema = new Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(OrderStatus),
            default: OrderStatus.Created,
        },
        expiresAt: {
            type: Schema.Types.Date,
        },
        ticket: { type: Schema.Types.ObjectId, ref: "Ticket" },
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

orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => new Order(attrs);
const Order = model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order };
