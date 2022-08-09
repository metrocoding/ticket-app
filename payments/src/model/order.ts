import { OrderStatus } from "@armineslami/ticketing-common";
import { Document, Model, model, Schema } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

//
interface OrderAttrs {
    id: string;
    status: OrderStatus;
    userId: string;
    price: number;
    version: number;
}

//
interface OrderModel extends Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
}

//
interface OrderDoc extends Document {
    status: OrderStatus;
    userId: string;
    price: number;
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
        price: {
            type: Number,
            required: true,
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

orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) =>
    new Order({
        _id: attrs.id,
        status: attrs.status,
        userId: attrs.userId,
        price: attrs.price,
        version: attrs.version,
    });
const Order = model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order };
