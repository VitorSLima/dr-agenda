import { doctorsTable } from "@/db/schema";

import { weekDays } from "../_constants";

export const getAvailability = (doctor: typeof doctorsTable.$inferSelect) => {
  const weekDayLabel = (day: number) =>
    weekDays.find((weekDay) => weekDay.value === day)?.label ?? "";
  return {
    fromWeekDay: weekDayLabel(doctor.availableFromWeekDay),
    toWeekDay: weekDayLabel(doctor.availableToWeekDay),
    fromTime: doctor.availableFromTime.slice(0, 5),
    toTime: doctor.availableToTime.slice(0, 5),
  };
};
