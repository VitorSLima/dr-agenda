import { z } from "zod";

export const createClinicSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
});

export type CreateClinicSchema = z.infer<typeof createClinicSchema>;
