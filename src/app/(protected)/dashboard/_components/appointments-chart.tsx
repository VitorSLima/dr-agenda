"use client";

import dayjs from "dayjs";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrencyInCents } from "@/helpers/currency";

interface AppointmentsChartProps {
  data: { date: string; appointments: number; revenue: number }[];
}

const config = {
  appointments: { label: "Agendamentos", color: "#0B68F7" },
  revenue: { label: "Faturamento", color: "#10B981" },
} satisfies ChartConfig;

const AppointmentsChart = ({ data }: AppointmentsChartProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Agendamentos e faturamento</CardTitle>
      <CardDescription>Por dia, no período selecionado</CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer config={config} className="h-72 w-full">
        <LineChart data={data} margin={{ left: 8, right: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: string) => dayjs(v).format("DD/MM")}
          />
          <YAxis
            yAxisId="left"
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickLine={false}
            axisLine={false}
            width={72}
            tickFormatter={(v: number) => formatCurrencyInCents(v)}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) =>
                  dayjs(payload?.[0]?.payload?.date).format("DD/MM/YYYY")
                }
                formatter={(value, name) => (
                  <span>
                    {config[name as keyof typeof config].label}:{" "}
                    {name === "revenue"
                      ? formatCurrencyInCents(Number(value))
                      : value}
                  </span>
                )}
              />
            }
          />
          <Line
            yAxisId="left"
            dataKey="appointments"
            type="linear"
            stroke="var(--color-appointments)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            dataKey="revenue"
            type="linear"
            stroke="var(--color-revenue)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </CardContent>
  </Card>
);

export default AppointmentsChart;
