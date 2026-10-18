import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;

    if (!key) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable");
    }

    client = new Stripe(key);
  }

  return client;
}
