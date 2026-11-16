import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

// Horários são tratados como "relógio de parede" em UTC, sem conversão de
// fuso, para que servidor e navegador sempre concordem.
export const SLOT_MINUTES = 30;

export const toWallClock = (date: string, time: string) =>
  dayjs.utc(`${date} ${time.slice(0, 5)}`, "YYYY-MM-DD HH:mm");

export const isWeekDayAvailable = (
  weekDay: number,
  from: number,
  to: number,
) =>
  from <= to
    ? weekDay >= from && weekDay <= to
    : weekDay >= from || weekDay <= to;

export const generateSlots = (from: string, to: string) => {
  const slots: string[] = [];
  const start = dayjs.utc(`2000-01-01 ${from.slice(0, 5)}`, "YYYY-MM-DD HH:mm");
  const end = dayjs.utc(`2000-01-01 ${to.slice(0, 5)}`, "YYYY-MM-DD HH:mm");
  for (
    let t = start;
    t.add(SLOT_MINUTES, "minute").valueOf() <= end.valueOf();
    t = t.add(SLOT_MINUTES, "minute")
  ) {
    slots.push(t.format("HH:mm"));
  }
  return slots;
};
