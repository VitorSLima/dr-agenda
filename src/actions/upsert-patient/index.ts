"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { clinicActionClient } from "@/lib/next-safe-action";

import { upsertPatientSchema } from "./schema";

export const upsertPatient = clinicActionClient
  .schema(upsertPatientSchema)
  .action(async ({ parsedInput: { id, ...data }, ctx: { clinicId } }) => {
    if (id) {
      const updated = await db
        .update(patientsTable)
        .set(data)
        .where(
          and(eq(patientsTable.id, id), eq(patientsTable.clinicId, clinicId)),
        )
        .returning({ id: patientsTable.id });
      if (updated.length === 0) {
        throw new Error("Paciente não encontrado");
      }
    } else {
      await db.insert(patientsTable).values({ ...data, clinicId });
    }
    revalidatePath("/patients");
  });
