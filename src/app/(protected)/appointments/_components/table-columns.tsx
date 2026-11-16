"use client";

import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { formatCurrencyInCents } from "@/helpers/currency";

import AppointmentsTableActions from "./table-actions";

dayjs.extend(utc);

type Appointment = typeof appointmentsTable.$inferSelect & {
  patient: typeof patientsTable.$inferSelect;
  doctor: typeof doctorsTable.$inferSelect;
};

export const appointmentsTableColumns: ColumnDef<Appointment>[] = [
  {
    id: "patient",
    header: "Paciente",
    cell: ({ row }) => row.original.patient.name,
  },
  {
    id: "doctor",
    header: "Médico",
    cell: ({ row }) => row.original.doctor.name,
  },
  {
    id: "date",
    header: "Data e hora",
    cell: ({ row }) =>
      dayjs.utc(row.original.date).format("DD/MM/YYYY [às] HH:mm"),
  },
  {
    id: "specialty",
    header: "Especialidade",
    cell: ({ row }) => row.original.doctor.specialty,
  },
  {
    id: "price",
    header: "Valor",
    cell: ({ row }) =>
      formatCurrencyInCents(row.original.appointmentPriceInCents),
  },
  {
    id: "actions",
    cell: ({ row }) => <AppointmentsTableActions appointment={row.original} />,
  },
];
