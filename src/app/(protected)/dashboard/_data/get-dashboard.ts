import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { and, count, eq, gte, lt } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

dayjs.extend(utc);

interface Params {
  clinicId: string;
  from: string;
  to: string;
}

export const getDashboard = async ({ clinicId, from, to }: Params) => {
  const start = dayjs.utc(from);
  const endExclusive = dayjs.utc(to).add(1, "day");

  const [appointments, [{ patients }], [{ doctors }]] = await Promise.all([
    db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.clinicId, clinicId),
        gte(appointmentsTable.date, start.toDate()),
        lt(appointmentsTable.date, endExclusive.toDate()),
      ),
      with: { doctor: true, patient: true },
      orderBy: appointmentsTable.date,
    }),
    db
      .select({ patients: count() })
      .from(patientsTable)
      .where(eq(patientsTable.clinicId, clinicId)),
    db
      .select({ doctors: count() })
      .from(doctorsTable)
      .where(eq(doctorsTable.clinicId, clinicId)),
  ]);

  const totalRevenue = appointments.reduce(
    (sum, a) => sum + a.appointmentPriceInCents,
    0,
  );

  const daily = new Map<string, { appointments: number; revenue: number }>();
  for (
    let d = start;
    d.valueOf() < endExclusive.valueOf();
    d = d.add(1, "day")
  ) {
    daily.set(d.format("YYYY-MM-DD"), { appointments: 0, revenue: 0 });
  }
  const byDoctor = new Map<
    string,
    { name: string; specialty: string; appointments: number }
  >();
  const bySpecialty = new Map<string, number>();

  for (const a of appointments) {
    const day = daily.get(dayjs.utc(a.date).format("YYYY-MM-DD"));
    if (day) {
      day.appointments += 1;
      day.revenue += a.appointmentPriceInCents;
    }
    const doc = byDoctor.get(a.doctorId) ?? {
      name: a.doctor.name,
      specialty: a.doctor.specialty,
      appointments: 0,
    };
    doc.appointments += 1;
    byDoctor.set(a.doctorId, doc);
    bySpecialty.set(
      a.doctor.specialty,
      (bySpecialty.get(a.doctor.specialty) ?? 0) + 1,
    );
  }

  return {
    totalRevenue,
    totalAppointments: appointments.length,
    totalPatients: patients,
    totalDoctors: doctors,
    chart: [...daily.entries()].map(([date, v]) => ({ date, ...v })),
    topDoctors: [...byDoctor.values()]
      .sort((a, b) => b.appointments - a.appointments)
      .slice(0, 5),
    topSpecialties: [...bySpecialty.entries()]
      .map(([specialty, appointments]) => ({ specialty, appointments }))
      .sort((a, b) => b.appointments - a.appointments)
      .slice(0, 5),
    appointments,
  };
};
