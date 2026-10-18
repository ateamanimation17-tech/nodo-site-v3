import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

async function upsertProfile(params: {
  userId?: string | null;
  customerId: string;
  subscriptionId?: string | null;
  status: string;
}) {
  const supabase = getSupabaseAdminClient();
  const { userId, customerId, subscriptionId, status } = params;

  if (userId) {
    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId ?? null,
        subscription_status: status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    if (error) {
      console.error("[webhook] profiles upsert failed", {
        userId,
        customerId,
        error,
      });
      throw new Error(`Supabase upsert failed: ${error.message}`);
    }
  } else {
    const { error } = await supabase
      .from("profiles")
      .update({
        stripe_subscription_id: subscriptionId ?? null,
        subscription_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_customer_id", customerId);
    if (error) {
      console.error("[webhook] profiles update failed", {
        customerId,
        error,
      });
      throw new Error(`Supabase update failed: ${error.message}`);
    }
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!webhookSecret || !signature) {
    return NextResponse.json(
      { error: "Missing webhook secret or signature" },
      { status: 400 }
    );
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripeClient().webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error("[webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("[webhook] checkout.session.completed", {
          customer: session.customer,
          mode: session.mode,
          client_reference_id: session.client_reference_id,
          subscription: session.subscription,
        });
        if (session.customer && session.mode === "subscription") {
          await upsertProfile({
            userId: session.client_reference_id,
            customerId: session.customer as string,
            subscriptionId: (session.subscription as string) ?? null,
            status: "trialing",
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await upsertProfile({
          userId: null,
          customerId: subscription.customer as string,
          subscriptionId: subscription.id,
          status: subscription.status,
        });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[webhook] handler failed", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
