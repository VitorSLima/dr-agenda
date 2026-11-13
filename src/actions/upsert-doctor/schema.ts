import { z } from "zod";

export const upsertDoctorSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(1, { message: "Nome é obrigatório." }),
    specialty: z
      .string()
      .trim()
      .min(1, { message: "Especialidade é obrigatória." }),
    appointmentPriceInCents: z
      .number()
      .int()
      .min(1, { message: "Preço da consulta é obrigatório." }),
    availableFromWeekDay: z.number().int().min(0).max(6),
    availableToWeekDay: z.number().int().min(0).max(6),
    availableFromTime: z
      .string()
      .min(1, { message: "Hora de início é obrigatória." }),
    availableToTime: z
      .string()
      .min(1, { message: "Hora de término é obrigatória." }),
  })
  .refine((data) => data.availableFromTime < data.availableToTime, {
    message: "O horário de término deve ser posterior ao de início.",
    path: ["availableToTime"],
  });

export type UpsertDoctorSchema = z.infer<typeof upsertDoctorSchema>;
