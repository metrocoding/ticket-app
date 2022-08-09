import { Document, Model, model, Schema } from "mongoose";
import { Password } from "../utils/password";

//
interface UserAttrs {
    email: string;
    password: string;
}

//
interface UserModel extends Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

//
interface UserDoc extends Document {
    email: string;
    password: string;
}

const userSchema = new Schema<UserDoc, UserModel>(
    {
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        toJSON: {
            transform(_doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.password;
                delete ret.__v;
            },
        },
    }
);

// use function instead of arrow to access this user
userSchema.pre("save", async function (done) {
    if (this.isModified("password")) {
        const hashed = await Password.toHash(this.get("password"));
        this.set("password", hashed);
    }
    done();
});

userSchema.statics.build = (attrs: UserAttrs) => new User(attrs);
const User = model<UserDoc, UserModel>("User", userSchema);

export { User };
