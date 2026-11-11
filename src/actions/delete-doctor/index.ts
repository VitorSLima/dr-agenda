"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { clinicActionClient } from "@/lib/next-safe-action";

export const deleteDoctor = clinicActionClient
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput: { id }, ctx: { clinicId } }) => {
    const deleted = await db
      .delete(doctorsTable)
      .where(and(eq(doctorsTable.id, id), eq(doctorsTable.clinicId, clinicId)))
      .returning({ id: doctorsTable.id });
    if (deleted.length === 0) {
      throw new Error("Médico não encontrado");
    }
    revalidatePath("/doctors");
  });
