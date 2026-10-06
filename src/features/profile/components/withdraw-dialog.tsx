"use client";

import { useState } from "react";
import { IconCash } from "@tabler/icons-react";
import { toast } from "sonner";

import { ActionDialog } from "#/features/jobs/components/action-dialog";
import { useRequestWithdrawal } from "#/hooks/use-account";
import { useAgentMe } from "#/hooks/use-agent-me";
import { friendlyError } from "#/lib/api/friendly-error";
import type { MomoOperator } from "#/lib/api/types";
import { MOMO_OPERATOR_LABELS } from "#/lib/movements";
import { guessMomoOperator, toInternational } from "#/lib/phone";
import { cn, formatXAF } from "#/lib/utils";

/**
 * Asking Rabotka to pay part of the available balance by Mobile Money. The
 * number defaults to the agent's own, and the network is guessed from it.
 */
export function WithdrawDialog({
  open,
  onOpenChange,
  available,
  min,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  available: number;
  min: number;
}>) {
  const { data: agent } = useAgentMe();
  const request = useRequestWithdrawal();
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState<string | null>(null);
  const [operator, setOperator] = useState<MomoOperator | null>(null);

  const typedPhone = phone ?? agent?.phone ?? "";
  const number = toInternational(typedPhone, "CG");
  const validNumber = /^\+\d{8,15}$/.test(number);
  const network = operator ?? guessMomoOperator(number);
  const value = Number(amount);
  const amountError =
    amount === ""
      ? null
      : !Number.isInteger(value) || value <= 0
        ? "Saisissez un montant entier."
        : value < min
          ? `Minimum ${formatXAF(min)}.`
          : value > available
            ? `Votre solde disponible est de ${formatXAF(available)}.`
            : null;
  const ready = amount !== "" && !amountError && validNumber && !!network;

  function close(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setAmount("");
      setPhone(null);
      setOperator(null);
    }
  }

  function submit() {
    if (!ready || !network) return;
    request.mutate(
      { amount: value, momoOperator: network, momoPhone: number },
      {
        onSuccess: () => {
          close(false);
          toast.success(
            `Demande envoyée : ${formatXAF(value)} vers ${MOMO_OPERATOR_LABELS[network]} ${number}.`,
          );
        },
        onError: (err) => toast.error(friendlyError(err, "Impossible d'envoyer la demande.")),
      },
    );
  }

  return (
    <ActionDialog
      open={open}
      onOpenChange={close}
      icon={<IconCash className="size-5" />}
      title="Demander un retrait"
      description={`Disponible : ${formatXAF(available)}. Le montant est réservé jusqu'au versement par l'équipe Rabotka.`}
      confirmLabel={ready ? `Demander ${formatXAF(value)}` : "Demander le retrait"}
      confirmDisabled={!ready}
      pending={request.isPending}
      onConfirm={submit}
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-medium text-sm">Montant</span>
          <span className="flex h-12 items-center gap-2 rounded-2xl bg-page px-4 focus-within:ring-2 focus-within:ring-ink/30">
            <input
              inputMode="numeric"
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder={String(min)}
              aria-label="Montant en FCFA"
              className="min-w-0 flex-1 bg-transparent text-base tabular-nums outline-none placeholder:text-muted-foreground"
            />
            <span className="text-muted-foreground text-sm">FCFA</span>
            <button
              type="button"
              onClick={() => setAmount(String(Math.floor(available)))}
              className="rounded-full bg-card px-3 py-1 font-medium text-xs shadow-soft"
            >
              Tout
            </button>
          </span>
          {amountError && <span className="px-1 text-destructive text-xs">{amountError}</span>}
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="font-medium text-sm">Réseau</span>
          <div className="grid grid-cols-2 gap-2">
            {(["MTN", "AIRTEL"] as const).map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => setOperator(op)}
                aria-pressed={network === op}
                className={cn(
                  "h-11 rounded-2xl font-medium text-sm transition-colors",
                  network === op ? "bg-ink text-white" : "bg-page text-muted-foreground hover:text-foreground",
                )}
              >
                {MOMO_OPERATOR_LABELS[op]}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="font-medium text-sm">Numéro Mobile Money</span>
          <input
            type="tel"
            inputMode="tel"
            value={typedPhone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+242 06 123 45 67"
            aria-label="Numéro Mobile Money"
            className="h-12 rounded-2xl bg-page px-4 text-base outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ink/30"
          />
          {typedPhone !== "" && !validNumber && (
            <span className="px-1 text-destructive text-xs">Numéro invalide.</span>
          )}
        </label>
      </div>
    </ActionDialog>
  );
}
