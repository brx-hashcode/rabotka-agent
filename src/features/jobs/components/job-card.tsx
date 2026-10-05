import Link from "next/link";
import { IconClock, IconLock } from "@tabler/icons-react";

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
 * takes the logo slot. Signed-in agents also see the description and pay.
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

  return (
    <Link
      href={href}
      scroll={false}
      className="group flex flex-col rounded-2xl bg-card p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

      {agentJob?.description && (
        <p className="mt-3 line-clamp-2 text-muted-foreground text-sm">
          {agentJob.description}
        </p>
      )}

      <div className="mt-auto pt-4">
        <div aria-hidden className="mb-4 h-px bg-border/70" />
        <div className="flex items-center justify-between gap-3">
          {agentJob ? (
            <p className="truncate">
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
            <p className="flex min-w-0 items-center gap-1.5 text-muted-foreground text-xs">
              <IconLock className="size-3.5 shrink-0" />
              <span className="truncate">Réservé aux agents</span>
            </p>
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

export function JobCardSkeleton() {
  return (
    <div className="flex h-52 flex-col gap-4 rounded-2xl bg-card p-6">
      <div className="flex gap-3">
        <div className="size-11 animate-pulse rounded-xl bg-muted" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 w-16 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-24 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="mt-auto h-5 w-full animate-pulse rounded bg-muted" />
    </div>
  );
}
