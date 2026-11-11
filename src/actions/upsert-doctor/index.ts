"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { clinicActionClient } from "@/lib/next-safe-action";

import { upsertDoctorSchema } from "./schema";

export const upsertDoctor = clinicActionClient
  .schema(upsertDoctorSchema)
  .action(async ({ parsedInput: { id, ...data }, ctx: { clinicId } }) => {
    if (id) {
      const updated = await db
        .update(doctorsTable)
        .set(data)
        .where(
          and(eq(doctorsTable.id, id), eq(doctorsTable.clinicId, clinicId)),
        )
        .returning({ id: doctorsTable.id });
      if (updated.length === 0) {
        throw new Error("Médico não encontrado");
      }
    } else {
      await db.insert(doctorsTable).values({ ...data, clinicId });
    }
    revalidatePath("/doctors");
  });
