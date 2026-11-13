"use client";

import { ColumnDef } from "@tanstack/react-table";

import { patientsTable } from "@/db/schema";

import PatientsTableActions from "./table-actions";

type Patient = typeof patientsTable.$inferSelect;

export const patientsTableColumns: ColumnDef<Patient>[] = [
  { id: "name", accessorKey: "name", header: "Nome" },
  { id: "email", accessorKey: "email", header: "Email" },
  {
    id: "phoneNumber",
    accessorKey: "phoneNumber",
    header: "Telefone",
    cell: ({ row }) =>
      row.original.phoneNumber.replace(
        /^(\d{2})(\d{4,5})(\d{4})$/,
        "($1) $2-$3",
      ),
  },
  {
    id: "sex",
    accessorKey: "sex",
    header: "Sexo",
    cell: ({ row }) => (row.original.sex === "male" ? "Masculino" : "Feminino"),
  },
  {
    id: "actions",
    cell: ({ row }) => <PatientsTableActions patient={row.original} />,
  },
];
