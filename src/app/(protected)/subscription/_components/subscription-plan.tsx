"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { createStripeCheckout } from "@/actions/create-stripe-checkout";
import { createStripePortal } from "@/actions/create-stripe-portal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  "Cadastro de até 3 médicos",
  "Agendamentos ilimitados",
  "Métricas básicas",
  "Cadastro de pacientes",
  "Confirmação manual",
  "Suporte via e-mail",
];

const redirectTo = ({ data }: { data?: { url: string } }) => {
  if (data?.url) window.location.href = data.url;
};

const SubscriptionPlan = ({ active }: { active: boolean }) => {
  const onError = () => toast.error("Não foi possível abrir o pagamento.");
  const checkout = useAction(createStripeCheckout, {
    onSuccess: redirectTo,
    onError,
  });
  const portal = useAction(createStripePortal, {
    onSuccess: redirectTo,
    onError,
  });
  const isPending = checkout.isPending || portal.isPending;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Essential</CardTitle>
          {active && <Badge>Atual</Badge>}
        </div>
        <CardDescription>
          Para profissionais autônomos ou pequenas clínicas
        </CardDescription>
        <p className="pt-2">
          <span className="text-3xl font-bold">R$ 59,90</span>
          <span className="text-muted-foreground"> / mês</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="text-primary h-4 w-4" />
              {feature}
            </li>
          ))}
        </ul>
        <Button
          className="w-full"
          variant={active ? "outline" : "default"}
          disabled={isPending}
          onClick={() => (active ? portal.execute() : checkout.execute())}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {active ? "Gerenciar assinatura" : "Assinar agora"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubscriptionPlan;
