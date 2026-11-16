import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { getStripe } from "@/lib/stripe";

export const POST = async (request: Request) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json(
      { error: "Webhook não configurado" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      signature,
      secret,
    );
  } catch {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id ?? session.metadata?.userId;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;
      if (userId && subscriptionId && customerId) {
        await db
          .update(usersTable)
          .set({
            plan: "essential",
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customerId,
          })
          .where(eq(usersTable.id, userId));
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await db
        .update(usersTable)
        .set({ plan: null, stripeSubscriptionId: null })
        .where(eq(usersTable.stripeSubscriptionId, subscription.id));
      break;
    }
  }
  return NextResponse.json({ received: true });
};
