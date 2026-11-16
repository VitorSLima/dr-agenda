"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { clinicsTable, usersToClinicsTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

import { createClinicSchema } from "./schema";

export const createClinic = protectedActionClient
  .schema(createClinicSchema)
  .action(async ({ parsedInput: { name }, ctx: { user } }) => {
    const existing = await db.query.usersToClinicsTable.findFirst({
      where: eq(usersToClinicsTable.userId, user.id),
    });
    if (existing) {
      throw new Error("Usuário já possui uma clínica");
    }
    await db.transaction(async (tx) => {
      const [clinic] = await tx
        .insert(clinicsTable)
        .values({ name })
        .returning();
      await tx
        .insert(usersToClinicsTable)
        .values({ userId: user.id, clinicId: clinic.id });
    });
    revalidatePath("/", "layout");
  });
