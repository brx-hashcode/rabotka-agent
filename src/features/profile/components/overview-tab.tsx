"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  IconArrowRight,
  IconCash,
  IconPercentage,
  IconPhoneCall,
  IconUserCheck,
  type Icon,
} from "@tabler/icons-react";

import { useAccountPlacements, useAgentStats } from "#/hooks/use-account";
import { friendlyError } from "#/lib/api/friendly-error";
import type { AgentStats } from "#/lib/api/types";
import { cn, formatXAF } from "#/lib/utils";
import type { AccountTab } from "./account-page";
import { PlacementItem } from "./placement-item";

/** The headline figures, the activity chart, the pipeline and the latest placements. */
export function OverviewTab({ onOpen }: Readonly<{ onOpen: (tab: AccountTab) => void }>) {
  const [days, setDays] = useState<30 | 90>(30);
  const stats = useAgentStats(days);
  const latest = useAccountPlacements(null);

  if (stats.isError) {
    return (
      <p className="rounded-3xl bg-card p-8 text-center text-muted-foreground text-sm shadow-soft">
        {friendlyError(stats.error, "Impossible de charger vos statistiques.")}
      </p>
    );
  }

  const s = stats.data;
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {s ? (
          <>
            <StatCard
              icon={IconUserCheck}
              label="Placements"
              value={String(s.placements.total)}
              hint={`+${s.placements.thisMonth} ce mois · ${s.placements.active} en cours`}
            />
            <StatCard
              icon={IconCash}
              label="Gains du mois"
              value={formatXAF(s.earnings.thisMonth)}
              hint={`Mois dernier : ${formatXAF(s.earnings.lastMonth)}`}
            />
            <StatCard
              icon={IconPercentage}
              label="Taux de placement"
              value={s.conversion === null ? "—" : `${Math.round(s.conversion * 100)} %`}
              hint="Travailleurs placés / pris en charge"
            />
            <StatCard
              icon={IconPhoneCall}
              label="Appels (30 j)"
              value={String(s.calls.last30Days)}
              hint={`${s.calls.total} au total`}
            />
          </>
        ) : (
          Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-card" />
          ))
        )}
      </div>

      <section className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-soft sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Activité</h2>
            <p className="text-muted-foreground text-xs">Placements par jour</p>
          </div>
          <div className="flex rounded-full bg-page p-1">
            {([30, 90] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={cn(
                  "rounded-full px-3 py-1 font-medium text-xs transition-colors",
                  days === d ? "bg-card text-foreground shadow-soft" : "text-muted-foreground",
                )}
              >
                {d} j
              </button>
            ))}
          </div>
        </div>
        {s ? <ActivityChart points={s.timeseries} /> : <div className="h-40 animate-pulse rounded-xl bg-page" />}
      </section>

      {s && <Pipeline pipeline={s.pipeline} />}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Derniers placements</h2>
          {latest.total > 3 && (
            <button
              type="button"
              onClick={() => onOpen("placements")}
              className="inline-flex items-center gap-1 font-medium text-sm text-whatsapp-dark hover:underline"
            >
              Tout voir
              <IconArrowRight className="size-4" />
            </button>
          )}
        </div>
        {latest.isPending ? (
          <div className="h-40 animate-pulse rounded-2xl bg-card" />
        ) : latest.placements.length === 0 ? (
          <p className="rounded-2xl bg-card px-5 py-6 text-center text-muted-foreground text-sm shadow-soft">
            Pas encore de placement. Ouvrez une offre de vos zones pour mobiliser des travailleurs.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border/60 rounded-2xl bg-card shadow-soft">
            {latest.placements.slice(0, 3).map((p) => (
              <PlacementItem key={p.applicationId} placement={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: Readonly<{ icon: Icon; label: string; value: string; hint: string }>) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-soft sm:p-5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-page text-muted-foreground">
        <Icon className="size-[18px]" />
      </span>
      <div className="min-w-0 space-y-0.5">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="truncate font-semibold text-xl tabular-nums sm:text-2xl">{value}</p>
        <p className="truncate text-muted-foreground text-xs">{hint}</p>
      </div>
    </div>
  );
}

/** Plain bars: a day's placements, with the commission earned in the tooltip. */
function ActivityChart({ points }: Readonly<{ points: AgentStats["timeseries"] }>) {
  const max = Math.max(1, ...points.map((p) => p.placements));
  const total = points.reduce((n, p) => n + p.placements, 0);
  const earned = points.reduce((n, p) => n + p.earned, 0);
  const first = points[0];
  const last = points.at(-1);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">
        <span className="font-semibold tabular-nums">{total}</span>{" "}
        <span className="text-muted-foreground">placement{total > 1 ? "s" : ""} ·</span>{" "}
        <span className="font-semibold tabular-nums">{formatXAF(earned)}</span>{" "}
        <span className="text-muted-foreground">gagnés</span>
      </p>
      <div className="flex h-36 items-end gap-[2px]" role="img" aria-label={`${total} placements sur la période`}>
        {points.map((p) => (
          <div
            key={p.date}
            title={`${format(parseISO(p.date), "d MMM", { locale: fr })} : ${p.placements} placement(s), ${formatXAF(p.earned)}`}
            className="flex h-full min-w-0 flex-1 items-end"
          >
            <div
              className={cn("w-full rounded-t-sm", p.placements > 0 ? "bg-whatsapp" : "bg-page")}
              style={{ height: p.placements > 0 ? `${(p.placements / max) * 100}%` : "4px" }}
            />
          </div>
        ))}
      </div>
      {first && last && (
        <div className="flex justify-between text-muted-foreground text-xs">
          <span>{format(parseISO(first.date), "d MMM", { locale: fr })}</span>
          <span>{format(parseISO(last.date), "d MMM", { locale: fr })}</span>
        </div>
      )}
    </div>
  );
}

function Pipeline({ pipeline }: Readonly<{ pipeline: AgentStats["pipeline"] }>) {
  const steps = [
    { label: "Pris en charge", value: pipeline.claimed, tone: "bg-chip-violet text-chip-violet-foreground" },
    { label: "Invités", value: pipeline.invited, tone: "bg-chip-amber text-chip-amber-foreground" },
    { label: "Placés", value: pipeline.confirmed, tone: "bg-chip-green text-chip-green-foreground" },
  ];
  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-soft sm:p-6">
      <div>
        <h2 className="font-semibold">Vos travailleurs</h2>
        <p className="text-muted-foreground text-xs">Où en sont ceux que vous avez pris en charge</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {steps.map((step) => (
          <div key={step.label} className={cn("flex flex-col gap-1 rounded-2xl p-3 sm:p-4", step.tone)}>
            <span className="font-semibold text-2xl tabular-nums">{step.value}</span>
            <span className="text-xs">{step.label}</span>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground text-xs">
        {pipeline.declined} refus · {pipeline.unreachable} injoignable{pipeline.unreachable > 1 ? "s" : ""}
      </p>
    </section>
  );
}
