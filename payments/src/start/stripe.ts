import Stripe from "stripe";

if (!process.env.STRIPE_KEY) throw new Error("env STRIPE_KEY is not defined");

export const stripe = new Stripe(process.env.STRIPE_KEY!, {
    apiVersion: "2020-08-27",
});
