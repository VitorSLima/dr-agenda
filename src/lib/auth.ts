import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { usersToClinicsTable } from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema,
  }),
  plugins: [
    customSession(async ({ user, session }) => {
      // TODO: suportar múltiplas clínicas por usuário
      const userClinic = await db.query.usersToClinicsTable.findFirst({
        where: eq(usersToClinicsTable.userId, user.id),
        with: { clinic: true },
      });
      return {
        user: {
          ...user,
          clinic: userClinic
            ? { id: userClinic.clinicId, name: userClinic.clinic.name }
            : undefined,
        },
        session,
      };
    }),
  ],
  user: {
    modelName: "usersTable",
  },
  session: {
    modelName: "sessionsTable",
  },
  account: {
    modelName: "accountsTable",
  },
  verification: {
    modelName: "verificationsTable",
  },
  emailAndPassword: {
    enabled: true,
  },
});
