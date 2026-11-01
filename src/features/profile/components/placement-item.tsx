import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { applicationStatus } from "#/features/jobs/application-status";
import { jobStatus } from "#/features/jobs/job-status";
import type { JobPlacement, PlacementCommission } from "#/lib/api/types";
import { cn, formatXAF, getInitials } from "#/lib/utils";

/** One worker the agent placed: who, on which job, where it stands, what it earns. */
export function PlacementItem({ placement: p }: Readonly<{ placement: JobPlacement }>) {
  const name = `${p.worker.firstName} ${p.worker.lastName}`.trim();
  const status = applicationStatus(p.status, p.rejectionSource);
  const failed = p.status === "REJECTED" || p.status === "CANCELLED";
  // Nothing is coming on a placement that ended without a commission.
  const commission = failed && !p.commission ? null : commissionChip(p.commission);

  const row = (
    <>
      <Avatar className="size-11 shrink-0">
        {p.worker.avatarUrl && <AvatarImage src={p.worker.avatarUrl} alt={name} />}
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{name}</p>
          <p className="truncate text-muted-foreground text-xs">
            {p.job.title}
            {" · "}
            {jobStatus(p.job.status).label}
            {" · "}
            {format(new Date(p.placedAt), "d MMM yyyy", { locale: fr })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
          <span className={cn("rounded-full px-2.5 py-1 font-medium text-xs", status.tone)}>
            {status.label}
          </span>
          {commission && (
            <span
              title={commission.title}
              className={cn("rounded-full px-2.5 py-1 font-medium text-xs tabular-nums", commission.tone)}
            >
              {commission.label}
            </span>
          )}
        </div>
      </div>
    </>
  );

  const className = "flex items-start gap-3 p-4 sm:items-center sm:p-5";
  if (!p.job.available) return <div className={className}>{row}</div>;
  // A full page, as from a job's side panel: the placements are on the workspace.
  return (
    <a href={`/jobs/${p.job.id}`} className={cn(className, "transition-colors hover:bg-page/60")}>
      {row}
    </a>
  );
}

function commissionChip(c: PlacementCommission | null): {
  label: string;
  tone: string;
  title?: string;
} {
  if (!c) {
    return {
      label: "Commission à venir",
      tone: "bg-page text-muted-foreground",
      title: "Décidée après le déblocage du contact par l'employeur.",
    };
  }
  switch (c.status) {
    case "AVAILABLE":
      return { label: `${formatXAF(c.amount)} · disponible`, tone: "bg-chip-green text-chip-green-foreground" };
    case "PENDING":
      return {
        label: c.availableAt
          ? `${formatXAF(c.amount)} · le ${format(new Date(c.availableAt), "d MMM", { locale: fr })}`
          : `${formatXAF(c.amount)} · en attente`,
        tone: "bg-chip-amber text-chip-amber-foreground",
        title: "Gagnée ; retirable à la fin de la période de confirmation.",
      };
    case "CANCELLED":
      return {
        label: "Commission annulée",
        tone: "bg-destructive/10 text-destructive",
        title: c.reason ?? undefined,
      };
    default:
      return {
        label: "Non éligible",
        tone: "bg-muted text-muted-foreground",
        title: c.reason ?? undefined,
      };
  }
}
