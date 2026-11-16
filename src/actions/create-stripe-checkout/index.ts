"use server";

import { protectedActionClient } from "@/lib/next-safe-action";
import { getStripe } from "@/lib/stripe";

export const createStripeCheckout = protectedActionClient.action(
  async ({ ctx: { user } }) => {
    const priceId = process.env.STRIPE_ESSENTIAL_PLAN_PRICE_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!priceId || !appUrl) throw new Error("Stripe não configurado");

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: { userId: user.id },
      subscription_data: { metadata: { userId: user.id } },
      success_url: `${appUrl}/dashboard`,
      cancel_url: `${appUrl}/subscription`,
    });
    if (!session.url) throw new Error("Falha ao criar sessão de pagamento");
    return { url: session.url };
  },
);
