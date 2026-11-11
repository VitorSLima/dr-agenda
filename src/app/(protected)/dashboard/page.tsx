import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
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
import { auth } from "@/lib/auth";

import AppointmentsChart from "./_components/appointments-chart";
import DateRangePicker from "./_components/date-range-picker";
import RankingCard from "./_components/ranking-card";
import StatsCards from "./_components/stats-cards";
import { getDashboard } from "./_data/get-dashboard";

dayjs.extend(utc);

interface DashboardPageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

const isDate = (v?: string): v is string =>
  !!v && /^\d{4}-\d{2}-\d{2}$/.test(v) && dayjs(v).isValid();

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user.clinic) {
    redirect("/clinic-form");
  }
  const params = await searchParams;
  const from = isDate(params.from)
    ? params.from
    : dayjs().startOf("month").format("YYYY-MM-DD");
  const to =
    isDate(params.to) && params.to >= from
      ? params.to
      : dayjs(from).endOf("month").format("YYYY-MM-DD");

  const data = await getDashboard({
    clinicId: session.user.clinic.id,
    from,
    to,
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            Acompanhe os principais indicadores da clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <DateRangePicker from={from} to={to} />
        </PageActions>
      </PageHeader>
      <PageContent>
        <StatsCards
          totalRevenue={data.totalRevenue}
          totalAppointments={data.totalAppointments}
          totalPatients={data.totalPatients}
          totalDoctors={data.totalDoctors}
        />
        <AppointmentsChart data={data.chart} />
        <div className="grid gap-4 lg:grid-cols-2">
          <RankingCard
            title="Médicos mais agendados"
            items={data.topDoctors.map((d) => ({
              label: d.name,
              sublabel: d.specialty,
              value: d.appointments,
            }))}
          />
          <RankingCard
            title="Especialidades mais agendadas"
            items={data.topSpecialties.map((s) => ({
              label: s.specialty,
              value: s.appointments,
            }))}
          />
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;
