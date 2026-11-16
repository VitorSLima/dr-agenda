"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { clinicActionClient } from "@/lib/next-safe-action";

export const deleteAppointment = clinicActionClient
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput: { id }, ctx: { clinicId } }) => {
    const deleted = await db
      .delete(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.id, id),
          eq(appointmentsTable.clinicId, clinicId),
        ),
      )
      .returning({ id: appointmentsTable.id });
    if (deleted.length === 0) {
      throw new Error("Agendamento não encontrado");
    }
    revalidatePath("/appointments");
  });
