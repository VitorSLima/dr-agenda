import { z } from "zod";

export const addAppointmentSchema = z.object({
  patientId: z.string().uuid({ message: "Paciente é obrigatório." }),
  doctorId: z.string().uuid({ message: "Médico é obrigatório." }),
  appointmentPriceInCents: z
    .number()
    .int()
    .min(1, { message: "Valor da consulta é obrigatório." }),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Data é obrigatória." }),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, { message: "Horário é obrigatório." }),
});

export type AddAppointmentSchema = z.infer<typeof addAppointmentSchema>;
