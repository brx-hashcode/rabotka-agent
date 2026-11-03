"use client";

import Link from "next/link";
import { IconClock, IconLock, IconMapPin, IconMapPinOff } from "@tabler/icons-react";

import { useSession } from "#/app/providers/session-context";
import { useAgentMe } from "#/hooks/use-agent-me";

import { isAgentJob, type FeedJob } from "#/hooks/use-jobs-feed";
import type { JobCategoryOption } from "#/lib/api/types";
import {
  EMPLOYMENT_TYPE_LABELS,
  PAYMENT_FLOW_LABELS,
  jobPlaceShort,
  jobStartShort,
  postedAgo,
  seatsLabel,
} from "#/lib/job-labels";
import { cn, formatXAF } from "#/lib/utils";

/**
 * One job, as the mockup's card. No employer anywhere — the category emoji
 * takes the logo slot. Every card shows the start of the description;
 * jobs in a signed-in agent's zones also show the pay.
 * A soft link to /jobs/[id], which the `@modal` slot opens as a side panel.
 */
export function JobCard({
  job,
  icon,
}: Readonly<{
  job: FeedJob;
  icon: JobCategoryOption["icon"] | undefined;
}>) {
  const href = `/jobs/${job.id}`;
  const start = jobStartShort(job.scheduledAt);
  const agentJob = isAgentJob(job) ? job : null;
  const summary = agentJob?.description ?? job.excerpt ?? null;

  return (
    <Link
      href={href}
      scroll={false}
      className="group flex min-w-0 flex-col rounded-2xl bg-card p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-page text-2xl"
        >
          {icon ?? "💼"}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-semibold text-[17px] leading-snug transition-colors group-hover:text-whatsapp-dark">
            {job.title}
          </h3>
          <p className="mt-0.5 truncate text-muted-foreground text-[13px]">
            {job.category?.name ?? "Sans catégorie"}
            <span className="mx-1.5">•</span>
            <span className={cn(job.seatsLeft <= 0 && "text-destructive")}>
              {seatsLabel(job.seatsLeft)}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Chip tone="violet">
          {EMPLOYMENT_TYPE_LABELS[job.employmentType] ?? job.employmentType}
        </Chip>
        <Chip tone="green">{jobPlaceShort(job)}</Chip>
        {start && <Chip tone="amber">{start}</Chip>}
      </div>

      {summary && (
        <p className="mt-3 line-clamp-2 text-muted-foreground text-sm">{summary}</p>
      )}

      <div className="mt-auto pt-4">
        <div aria-hidden className="mb-4 h-px bg-border/70" />
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          {agentJob ? (
            <p className="min-w-0">
              {agentJob.amount !== null ? (
                <>
                  <span className="font-bold text-lg">{formatXAF(agentJob.amount)}</span>
                  {agentJob.paymentFlow && (
                    <span className="text-muted-foreground text-sm">
                      {" "}
                      {PAYMENT_FLOW_LABELS[agentJob.paymentFlow]}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground text-sm">Rémunération à définir</span>
              )}
            </p>
          ) : (
            <PublicJobNote job={job} />
          )}
          <span className="flex shrink-0 items-center gap-1 text-muted-foreground text-xs">
            <IconClock className="size-3.5" />
            {postedAgo(job.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Where the pay of a public card is. Visitors: agents only. A signed-in agent
 * browsing every job: whether it lies in their zones — opening one that does
 * shows the pay; the others stay summary-only.
 */
function PublicJobNote({ job }: Readonly<{ job: FeedJob }>) {
  const { isAuthenticated } = useSession();
  const { data: agent } = useAgentMe();

  let icon = IconLock;
  let label = "Réservé aux agents";
  if (isAuthenticated && agent) {
    const city = job.city?.trim().toLowerCase();
    const inZones =
      !!city &&
      agent.zones.some(
        (z) =>
          z.city.trim().toLowerCase() === city &&
          (!job.countryCode || z.countryCode === job.countryCode),
      );
    icon = inZones ? IconMapPin : IconMapPinOff;
    label = inZones ? "Dans vos zones" : "Hors de vos zones";
  }
  const Icon = icon;

  return (
    <p className="flex min-w-0 items-center gap-1.5 text-muted-foreground text-xs">
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </p>
  );
}

const TONES = {
  violet: "bg-chip-violet text-chip-violet-foreground",
  green: "bg-chip-green text-chip-green-foreground",
  amber: "bg-chip-amber text-chip-amber-foreground",
} as const;

function Chip({
  tone,
  children,
}: Readonly<{ tone: keyof typeof TONES; children: React.ReactNode }>) {
  return (
    <span className={cn("rounded-md px-2 py-0.5 font-medium text-xs", TONES[tone])}>
      {children}
    </span>
  );
}

export { JobCardSkeleton } from "#/components/page-skeletons";
