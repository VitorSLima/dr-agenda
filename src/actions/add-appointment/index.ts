"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { generateSlots, isWeekDayAvailable, toWallClock } from "@/helpers/time";
import { clinicActionClient } from "@/lib/next-safe-action";

import { addAppointmentSchema } from "./schema";

export const addAppointment = clinicActionClient
  .schema(addAppointmentSchema)
  .action(
    async ({
      parsedInput: { patientId, doctorId, appointmentPriceInCents, date, time },
      ctx: { clinicId },
    }) => {
      const [doctor, patient] = await Promise.all([
        db.query.doctorsTable.findFirst({
          where: and(
            eq(doctorsTable.id, doctorId),
            eq(doctorsTable.clinicId, clinicId),
          ),
        }),
        db.query.patientsTable.findFirst({
          where: and(
            eq(patientsTable.id, patientId),
            eq(patientsTable.clinicId, clinicId),
          ),
        }),
      ]);
      if (!doctor) throw new Error("Médico não encontrado");
      if (!patient) throw new Error("Paciente não encontrado");

      const when = toWallClock(date, time);
      const slotIsValid =
        isWeekDayAvailable(
          when.day(),
          doctor.availableFromWeekDay,
          doctor.availableToWeekDay,
        ) &&
        generateSlots(
          doctor.availableFromTime,
          doctor.availableToTime,
        ).includes(time);
      if (!slotIsValid) throw new Error("Horário indisponível");

      const existing = await db.query.appointmentsTable.findFirst({
        where: and(
          eq(appointmentsTable.doctorId, doctorId),
          eq(appointmentsTable.date, when.toDate()),
        ),
      });
      if (existing) throw new Error("Horário indisponível");

      await db.insert(appointmentsTable).values({
        clinicId,
        patientId,
        doctorId,
        appointmentPriceInCents,
        date: when.toDate(),
      });
      revalidatePath("/appointments");
    },
  );
