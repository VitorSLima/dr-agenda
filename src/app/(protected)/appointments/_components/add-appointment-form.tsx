"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { ptBR } from "react-day-picker/locale";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";

import { addAppointment } from "@/actions/add-appointment";
import {
  type AddAppointmentSchema,
  addAppointmentSchema,
} from "@/actions/add-appointment/schema";
import { getAvailableTimes } from "@/actions/get-available-times";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { doctorsTable, patientsTable } from "@/db/schema";
import { cn } from "@/lib/utils";

interface AddAppointmentFormProps {
  isOpen: boolean;
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  onSuccess?: () => void;
}

const emptyValues = {
  patientId: "",
  doctorId: "",
  appointmentPriceInCents: 0,
  date: "",
  time: "",
};

const AddAppointmentForm = ({
  isOpen,
  patients,
  doctors,
  onSuccess,
}: AddAppointmentFormProps) => {
  const form = useForm<AddAppointmentSchema>({
    resolver: zodResolver(addAppointmentSchema),
    defaultValues: emptyValues,
  });

  const doctorId = form.watch("doctorId");
  const patientId = form.watch("patientId");
  const date = form.watch("date");

  const times = useAction(getAvailableTimes);

  useEffect(() => {
    if (isOpen) form.reset(emptyValues);
  }, [isOpen, form]);

  useEffect(() => {
    const doctor = doctors.find((d) => d.id === doctorId);
    if (doctor) {
      form.setValue("appointmentPriceInCents", doctor.appointmentPriceInCents);
    }
  }, [doctorId, doctors, form]);

  useEffect(() => {
    form.setValue("time", "");
    if (doctorId && date) {
      times.execute({ doctorId, date });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, date]);

  const { execute, isPending } = useAction(addAppointment, {
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso.");
      onSuccess?.();
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Erro ao criar agendamento."),
  });

  const availableTimes = times.result.data ?? [];
  const isDateEnabled = !!patientId && !!doctorId;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Novo agendamento</DialogTitle>
        <DialogDescription>
          Selecione paciente, médico, data e horário.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((v) => execute(v))}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Médico</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um médico" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} - {d.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="appointmentPriceInCents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da consulta</FormLabel>
                <NumericFormat
                  value={field.value / 100}
                  onValueChange={(v) =>
                    field.onChange(Math.round((v.floatValue ?? 0) * 100))
                  }
                  decimalScale={2}
                  fixedDecimalScale
                  decimalSeparator=","
                  thousandSeparator="."
                  prefix="R$ "
                  allowNegative={false}
                  disabled={!doctorId}
                  customInput={Input}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!isDateEnabled}
                        className={cn(
                          "justify-start font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="h-4 w-4" />
                        {field.value
                          ? dayjs(field.value).format("DD/MM/YYYY")
                          : "Selecione uma data"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      locale={ptBR}
                      mode="single"
                      selected={
                        field.value ? dayjs(field.value).toDate() : undefined
                      }
                      onSelect={(d) =>
                        field.onChange(d ? dayjs(d).format("YYYY-MM-DD") : "")
                      }
                      disabled={(d) => d < dayjs().startOf("day").toDate()}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!doctorId || !date || times.isPending}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableTimes.length === 0 && (
                      <p className="text-muted-foreground px-2 py-1.5 text-sm">
                        Sem horários nesta data.
                      </p>
                    )}
                    {availableTimes.map((t) => (
                      <SelectItem
                        key={t.value}
                        value={t.value}
                        disabled={!t.available}
                      >
                        {t.value} {!t.available && "(indisponível)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Agendar
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default AddAppointmentForm;
