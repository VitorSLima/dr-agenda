"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";
import { getStripe } from "@/lib/stripe";

export const createStripePortal = protectedActionClient.action(
  async ({ ctx: { user } }) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) throw new Error("Stripe não configurado");

    const dbUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, user.id),
    });
    if (!dbUser?.stripeCustomerId)
      throw new Error("Cliente Stripe não encontrado");

    const session = await getStripe().billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${appUrl}/subscription`,
    });
    return { url: session.url };
  },
);
