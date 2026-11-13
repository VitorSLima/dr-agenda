"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { and, eq, gte, lt } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable, doctorsTable } from "@/db/schema";
import { generateSlots, isWeekDayAvailable, toWallClock } from "@/helpers/time";
import { clinicActionClient } from "@/lib/next-safe-action";

dayjs.extend(utc);

export const getAvailableTimes = clinicActionClient
  .schema(
    z.object({
      doctorId: z.string().uuid(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
  )
  .action(async ({ parsedInput: { doctorId, date }, ctx: { clinicId } }) => {
    const doctor = await db.query.doctorsTable.findFirst({
      where: and(
        eq(doctorsTable.id, doctorId),
        eq(doctorsTable.clinicId, clinicId),
      ),
    });
    if (!doctor) throw new Error("Médico não encontrado");

    const day = toWallClock(date, "00:00");
    if (
      !isWeekDayAvailable(
        day.day(),
        doctor.availableFromWeekDay,
        doctor.availableToWeekDay,
      )
    ) {
      return [];
    }

    const booked = await db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.doctorId, doctorId),
        gte(appointmentsTable.date, day.toDate()),
        lt(appointmentsTable.date, day.add(1, "day").toDate()),
      ),
    });
    const bookedTimes = new Set(
      booked.map((a) => dayjs.utc(a.date).format("HH:mm")),
    );

    return generateSlots(doctor.availableFromTime, doctor.availableToTime).map(
      (time) => ({ value: time, available: !bookedTimes.has(time) }),
    );
  });
