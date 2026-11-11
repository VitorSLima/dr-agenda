import { headers } from "next/headers";
import { createSafeActionClient } from "next-safe-action";

import { auth } from "@/lib/auth";

export const actionClient = createSafeActionClient();

export const protectedActionClient = actionClient.use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return next({ ctx: { user: session.user } });
});

export const clinicActionClient = protectedActionClient.use(
  async ({ next, ctx }) => {
    if (!ctx.user.clinic) {
      throw new Error("Clinic not found");
    }
    return next({ ctx: { clinicId: ctx.user.clinic.id } });
  },
);
