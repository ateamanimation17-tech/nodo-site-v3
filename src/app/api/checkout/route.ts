import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: "Missing userId or email" },
        { status: 400 }
      );
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      throw new Error("Missing STRIPE_PRICE_ID environment variable");
    }

    const origin = request.headers.get("origin") ?? new URL(request.url).origin;

    const session = await getStripeClient().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 5 },
      customer_email: email,
      client_reference_id: userId,
      allow_promotion_codes: true,
      success_url: `${origin}/app?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      // Stripe's newer "Managed Payments" feature requires every product to
      // have a tax code set, which NODO Membership doesn't have yet. Disable
      // it for this session rather than touching the account-wide setting.
      managed_payments: { enabled: false },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] failed", err);
    return NextResponse.json(
      { error: "Could not start checkout" },
      { status: 500 }
    );
  }
}
