"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { clinicActionClient } from "@/lib/next-safe-action";

export const deletePatient = clinicActionClient
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput: { id }, ctx: { clinicId } }) => {
    const deleted = await db
      .delete(patientsTable)
      .where(
        and(eq(patientsTable.id, id), eq(patientsTable.clinicId, clinicId)),
      )
      .returning({ id: patientsTable.id });
    if (deleted.length === 0) {
      throw new Error("Paciente não encontrado");
    }
    revalidatePath("/patients");
  });
