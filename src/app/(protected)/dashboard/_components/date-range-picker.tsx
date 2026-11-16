"use client";

import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  from: string;
  to: string;
}

const DateRangePicker = ({ from, to }: DateRangePickerProps) => {
  const router = useRouter();
  const selected: DateRange = {
    from: dayjs(from).toDate(),
    to: dayjs(to).toDate(),
  };

  const handleSelect = (range?: DateRange) => {
    if (!range?.from) return;
    const start = dayjs(range.from).format("YYYY-MM-DD");
    const end = dayjs(range.to ?? range.from).format("YYYY-MM-DD");
    router.push(`/dashboard?from=${start}&to=${end}`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="bg-white font-normal">
          <CalendarIcon className="h-4 w-4" />
          {dayjs(from).format("DD/MM/YYYY")} - {dayjs(to).format("DD/MM/YYYY")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="range"
          locale={ptBR}
          selected={selected}
          onSelect={handleSelect}
          defaultMonth={selected.from}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;
