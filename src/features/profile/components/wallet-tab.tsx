"use client";

import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconCash,
  IconClockHour4,
  IconCoinOff,
  IconHourglass,
  IconInfoCircle,
  IconReceipt,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "#/components/ui/button";
import { ActionDialog } from "#/features/jobs/components/action-dialog";
import {
  useCancelWithdrawal,
  useWallet,
  useWithdrawalOutcome,
  useWithdrawals,
} from "#/hooks/use-account";
import { friendlyError } from "#/lib/api/friendly-error";
import type {
  AgentMovement,
  AgentWallet,
  AgentWithdrawal,
  WithdrawalStatus,
} from "#/lib/api/types";
import {
  MOMO_OPERATOR_LABELS as OPERATOR_LABELS,
  movementFlow,
  movementView,
  type MovementTone,
} from "#/lib/movements";
import { cn, formatXAF } from "#/lib/utils";
import { WithdrawDialog } from "./withdraw-dialog";

/** The agent's money: what they can withdraw, what is coming, and every movement. */
export function WalletTab() {
  const wallet = useWallet();
  const [withdrawing, setWithdrawing] = useState(false);
  // undefined while loading, so the first load is not read as a decision.
  useWithdrawalOutcome(wallet.wallet ? (wallet.wallet.openWithdrawal?.id ?? null) : undefined);

  if (wallet.isError) {
    return (
      <p className="rounded-3xl bg-card p-8 text-center text-muted-foreground text-sm">
        {friendlyError(wallet.error, "Impossible de charger votre portefeuille.")}
      </p>
    );
  }
  if (!wallet.wallet) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-56 animate-pulse rounded-3xl bg-card" />
        <div className="h-72 animate-pulse rounded-3xl bg-card" />
      </div>
    );
  }

  const w = wallet.wallet;
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="flex min-w-0 flex-col gap-6">
        <BalanceCard wallet={w} onWithdraw={() => setWithdrawing(true)} />
        <Movements movements={wallet.movements} />
      </div>
      <aside className="flex min-w-0 flex-col gap-6">
        <Rules wallet={w} />
        <WithdrawalHistory />
      </aside>

      <WithdrawDialog
        open={withdrawing}
        onOpenChange={setWithdrawing}
        available={w.balance.available}
        min={w.rules.withdrawalMinFcfa}
      />
    </div>
  );
}

function BalanceCard({
  wallet: { balance, rules, openWithdrawal },
  onWithdraw,
}: Readonly<{ wallet: AgentWallet; onWithdraw: () => void }>) {
  const belowMin = balance.available < rules.withdrawalMinFcfa;

  return (
    <section className="flex flex-col gap-6 rounded-3xl bg-header p-5 text-header-foreground sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-header-muted text-sm">Solde disponible</p>
          <p className="font-semibold text-4xl tabular-nums tracking-tight sm:text-5xl">
            {formatXAF(balance.available)}
          </p>
          <p className="text-header-muted text-xs">Total gagné : {formatXAF(balance.totalEarned)}</p>
        </div>
        {/* One request at a time: while one waits, it takes the button's place. */}
        {openWithdrawal ? (
          <PendingRequest withdrawal={openWithdrawal} />
        ) : (
          <div className="flex flex-col items-stretch gap-1.5 sm:items-end">
            <Button
              size="lg"
              className="w-full rounded-full px-6 sm:w-auto"
              onClick={onWithdraw}
              disabled={belowMin}
            >
              <IconCash />
              Demander un retrait
            </Button>
            {belowMin && (
              <p className="text-header-muted text-xs">
                Retrait possible à partir de {formatXAF(rules.withdrawalMinFcfa)}.
              </p>
            )}
          </div>
        )}
      </div>

      <dl className="grid gap-2 sm:grid-cols-3">
        {[
          { label: "En attente", value: balance.pending, icon: IconHourglass },
          { label: "En retrait", value: balance.locked, icon: IconClockHour4 },
          { label: "Déjà versé", value: balance.paidOut, icon: IconReceipt },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex min-w-0 items-center justify-between gap-2 rounded-2xl bg-white/45 px-3 py-2.5 sm:block sm:p-3 dark:bg-black/20"
          >
            <dt className="flex items-center gap-1.5 text-header-muted text-xs">
              <Icon className="size-3.5 shrink-0" />
              <span className="truncate">{label}</span>
            </dt>
            <dd className="truncate font-semibold tabular-nums sm:mt-1 sm:text-lg">{formatXAF(value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** The request waiting for an admin, inside the balance card, with a way to take it back. */
function PendingRequest({ withdrawal: w }: Readonly<{ withdrawal: AgentWithdrawal }>) {
  const [confirming, setConfirming] = useState(false);
  const cancel = useCancelWithdrawal();

  return (
    <div className="flex w-full flex-col gap-2 rounded-2xl bg-white/60 p-4 sm:w-80 dark:bg-black/20">
      <div className="flex items-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-chip-amber px-2.5 py-1 font-medium text-chip-amber-foreground text-xs">
          <IconClockHour4 className="size-3.5" />
          Retrait en attente
        </span>
      </div>
      <p className="font-semibold text-2xl tabular-nums tracking-tight">{formatXAF(w.amount)}</p>
      <p className="text-header-muted text-xs leading-relaxed">
        Vers {OPERATOR_LABELS[w.momoOperator]} {w.momoPhone}
        <br />
        Demandé le {format(new Date(w.createdAt), "d MMM 'à' HH'h'mm", { locale: fr })}
      </p>
      <Button
        size="lg"
        variant="destructive"
        className="mt-1 w-full rounded-full"
        onClick={() => setConfirming(true)}
      >
        <IconX />
        Annuler la demande
      </Button>

      <ActionDialog
        open={confirming}
        onOpenChange={setConfirming}
        tone="warning"
        icon={<IconCoinOff className="size-5" />}
        title="Annuler cette demande de retrait ?"
        description={`${formatXAF(w.amount)} reviennent sur votre solde disponible. Vous pourrez refaire une demande ensuite.`}
        confirmLabel="Annuler la demande"
        pending={cancel.isPending}
        onConfirm={() =>
          cancel.mutate(w.id, {
            onSuccess: () => {
              setConfirming(false);
              toast.success("Demande annulée : le montant est de nouveau disponible.");
            },
            onError: (err) => {
              setConfirming(false);
              toast.error(friendlyError(err, "Impossible d'annuler cette demande."));
            },
          })
        }
      />
    </div>
  );
}

function Rules({ wallet: { rules } }: Readonly<{ wallet: AgentWallet }>) {
  const release =
    rules.releaseEvent === "COMPLETED"
      ? "la fin de la mission"
      : "le déblocage du contact par l'employeur";
  return (
    <section className="flex flex-col gap-3 rounded-3xl bg-card p-5 text-sm">
      <h2 className="flex items-center gap-2 font-semibold">
        <IconInfoCircle className="size-4 text-muted-foreground" />
        Comment vous êtes payé
      </h2>
      <ul className="flex flex-col gap-2 text-muted-foreground">
        <li>
          <span className="font-medium text-foreground">{formatXAF(rules.commissionFcfa)}</span> par
          travailleur placé.
        </li>
        <li>
          La commission est gagnée après {release}, puis retirable{" "}
          {rules.confirmationHours > 0 ? `${rules.confirmationHours} h plus tard` : "aussitôt"}.
        </li>
        <li>
          Retrait par Mobile Money à partir de{" "}
          <span className="font-medium text-foreground">{formatXAF(rules.withdrawalMinFcfa)}</span>,
          versé par l&apos;équipe Rabotka.
        </li>
      </ul>
    </section>
  );
}

const TONE_STYLES: Record<MovementTone, { icon: string; amount: string; sign: string }> = {
  gain: { icon: "bg-chip-green text-chip-green-foreground", amount: "text-chip-green-foreground", sign: "+" },
  loss: { icon: "bg-destructive/10 text-destructive", amount: "text-destructive", sign: "−" },
  neutral: { icon: "bg-page text-muted-foreground", amount: "text-foreground", sign: "" },
};

/** The latest movements, by day. */
function Movements({ movements }: Readonly<{ movements: AgentMovement[] }>) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-semibold text-lg">Mouvements</h2>
      {movements.length === 0 ? (
        <p className="rounded-2xl bg-card px-5 py-6 text-center text-muted-foreground text-sm">
          Aucun mouvement pour l&apos;instant. Vos commissions apparaîtront ici.
        </p>
      ) : (
        <div className="flex flex-col rounded-2xl bg-card">
          {movements.map((m, i) => {
            const day = new Date(m.at);
            const newDay = i === 0 || !isSameDay(day, new Date(movements[i - 1].at));
            return (
              <div key={m.id}>
                {newDay && (
                  <p className="px-5 pt-4 pb-1 font-medium text-muted-foreground text-xs first-letter:uppercase">
                    {format(day, "EEEE d MMMM yyyy", { locale: fr })}
                  </p>
                )}
                <MovementRow movement={m} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MovementRow({ movement: m }: Readonly<{ movement: AgentMovement }>) {
  const view = movementView(m);
  const tone = TONE_STYLES[view.tone];
  const Icon = view.tone === "gain" ? IconArrowDownLeft : view.tone === "loss" ? IconCoinOff : IconArrowUpRight;

  const details: string[] = [];
  if (m.commission) {
    if (m.commission.worker.name) details.push(m.commission.worker.name);
    if (m.commission.job.title) details.push(m.commission.job.title);
    if (m.kind === "COMMISSION_CANCELLED" && (m.description ?? m.commission.reason)) {
      details.push((m.description ?? m.commission.reason) as string);
    }
  }
  if (m.withdrawal) {
    details.push(`${OPERATOR_LABELS[m.withdrawal.momoOperator]} ${m.withdrawal.momoPhone}`);
    if (m.kind === "WITHDRAWAL_PAID" && m.withdrawal.providerReference) {
      details.push(`Réf. ${m.withdrawal.providerReference}`);
    }
    if (m.kind === "WITHDRAWAL_REJECTED" && m.withdrawal.rejectionReason) {
      details.push(m.withdrawal.rejectionReason);
    }
  }

  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", tone.icon)}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-sm">{view.title}</p>
        <p className="truncate text-muted-foreground text-xs">
          {[format(new Date(m.at), "HH'h'mm"), ...details].join(" · ")}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className={cn("font-semibold text-sm tabular-nums", tone.amount)}>
          {tone.sign}
          {formatXAF(m.amount)}
        </p>
        <p className="hidden text-muted-foreground text-xs sm:block">{movementFlow(m.moves)}</p>
      </div>
    </div>
  );
}

const WITHDRAWAL_STATUS: Record<WithdrawalStatus, { label: string; tone: string }> = {
  REQUESTED: { label: "En attente", tone: "bg-chip-amber text-chip-amber-foreground" },
  PAID: { label: "Versé", tone: "bg-chip-green text-chip-green-foreground" },
  REJECTED: { label: "Refusé", tone: "bg-destructive/10 text-destructive" },
  CANCELLED: { label: "Annulé", tone: "bg-muted text-muted-foreground" },
};

function WithdrawalHistory() {
  const list = useWithdrawals();
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-semibold text-lg">Mes retraits</h2>
      {list.isPending ? (
        <div className="h-40 animate-pulse rounded-2xl bg-card" />
      ) : list.withdrawals.length === 0 ? (
        <p className="rounded-2xl bg-card px-5 py-6 text-center text-muted-foreground text-sm">
          Aucun retrait demandé.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-border/60 rounded-2xl bg-card">
          {list.withdrawals.map((w) => {
            const status = WITHDRAWAL_STATUS[w.status];
            const note =
              w.status === "PAID" && w.providerReference
                ? `Réf. ${w.providerReference}`
                : w.status === "REJECTED"
                  ? w.rejectionReason
                  : null;
            return (
              <div key={w.id} className="flex flex-col gap-1 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm tabular-nums">{formatXAF(w.amount)}</span>
                  <span className={cn("rounded-full px-2 py-0.5 font-medium text-xs", status.tone)}>
                    {status.label}
                  </span>
                </div>
                <p className="truncate text-muted-foreground text-xs">
                  {format(new Date(w.createdAt), "d MMM yyyy", { locale: fr })} ·{" "}
                  {OPERATOR_LABELS[w.momoOperator]} {w.momoPhone}
                </p>
                {note && <p className="text-muted-foreground text-xs">{note}</p>}
              </div>
            );
          })}
          {list.hasNextPage && (
            <button
              type="button"
              onClick={() => void list.fetchNextPage()}
              disabled={list.isFetchingNextPage}
              className="px-4 py-3 font-medium text-sm text-whatsapp-dark hover:underline"
            >
              {list.isFetchingNextPage ? "Chargement…" : "Voir plus"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
