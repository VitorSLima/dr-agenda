import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { MAX_DOCTORS_ESSENTIAL_PLAN } from "@/helpers/plan-limits";
import { auth } from "@/lib/auth";

import AddDoctorButton from "./_components/add-doctor-button";
import DoctorCard from "./_components/doctor-card";

const DoctorsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user.clinic) {
    redirect("/clinic-form");
  }
  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, session.user.clinic.id),
    orderBy: doctorsTable.name,
  });
  const limitReached =
    session.user.plan === "essential" &&
    doctors.length >= MAX_DOCTORS_ESSENTIAL_PLAN;
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Médicos</PageTitle>
          <PageDescription>Gerencie os médicos da sua clínica</PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddDoctorButton disabled={limitReached} />
        </PageActions>
      </PageHeader>
      <PageContent>
        {doctors.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nenhum médico cadastrado ainda.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default DoctorsPage;
