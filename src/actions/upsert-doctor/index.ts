"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { MAX_DOCTORS_ESSENTIAL_PLAN } from "@/helpers/plan-limits";
import { clinicActionClient } from "@/lib/next-safe-action";

import { upsertDoctorSchema } from "./schema";

export const upsertDoctor = clinicActionClient
  .schema(upsertDoctorSchema)
  .action(async ({ parsedInput: { id, ...data }, ctx: { clinicId, user } }) => {
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
      if (user.plan === "essential") {
        const [{ total }] = await db
          .select({ total: count() })
          .from(doctorsTable)
          .where(eq(doctorsTable.clinicId, clinicId));
        if (total >= MAX_DOCTORS_ESSENTIAL_PLAN) {
          throw new Error("Limite de médicos do plano atingido");
        }
      }
      await db.insert(doctorsTable).values({ ...data, clinicId });
    }
    revalidatePath("/doctors");
  });
