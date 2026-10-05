"use client";

import { useState } from "react";
import Link from "next/link";
import { IconArrowLeft, IconShare } from "@tabler/icons-react";

import { Button } from "#/components/ui/button";
import { useCandidates } from "#/hooks/use-candidates";
import { useJobDetail } from "#/hooks/use-job-detail";
import { cn } from "#/lib/utils";
import { CandidatesList } from "./candidates";
import {
  JobDetailSkeleton,
  JobHeader,
  JobLoadError,
  JobSummary,
  ROUND_BUTTON,
  shareJob,
} from "./job-detail";

type Tab = "candidats" | "offre";

/**
 * The full /jobs/[id] page — the agent's workspace for one job.
 *
 * Agents (job in their zones): desktop shows the job on the left and the
 * suggested workers on the right; phones show a compact header and two tabs,
 * opening on the workers. Visitors, and agents looking at a job outside
 * their zones, get the job alone, centred.
 */
export function JobWorkspace({ id }: Readonly<{ id: string }>) {
  const detail = useJobDetail(id);
  const isAgentJob = detail.data?.kind === "agent";
  const candidates = useCandidates(id, isAgentJob);
  const [tab, setTab] = useState<Tab>("candidats");
  const jobPath = `/jobs/${id}`;

  const topBar = (
    <div className="flex items-center justify-between gap-3 pb-5">
      <Link
        href="/"
        className="-ml-2 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-muted-foreground text-sm transition-colors hover:bg-card hover:text-foreground"
      >
        <IconArrowLeft className="size-4" />
        Toutes les offres
      </Link>
      {detail.data && (
        <button
          type="button"
          onClick={() => void shareJob(detail.data.job.title, jobPath)}
          className={cn(ROUND_BUTTON, "bg-card")}
          aria-label="Partager l'offre"
        >
          <IconShare className="size-4.5" />
        </button>
      )}
    </div>
  );

  if (detail.isPending || detail.isError) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        {topBar}
        <div className="rounded-3xl bg-card p-5 sm:p-8">
          {detail.isPending ? <JobDetailSkeleton /> : <JobLoadError error={detail.error} />}
        </div>
      </div>
    );
  }

  if (!isAgentJob) {
    const anonymous = detail.data.kind === "public" && !detail.data.outsideZones;
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        {topBar}
        <div className="flex flex-col gap-6 rounded-3xl bg-card p-5 sm:p-8">
          <JobSummary detail={detail.data} />
          {anonymous && (
            <Button
              size="xl"
              className="w-full rounded-full"
              render={<Link href={`/auth/sign-in?next=${encodeURIComponent(jobPath)}`} scroll={false} />}
            >
              Se connecter pour voir la rémunération
            </Button>
          )}
        </div>
      </div>
    );
  }

  const count = candidates.data?.length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      {topBar}

      {/* Phones: compact header and the two tabs. */}
      <div className="flex flex-col gap-4 pb-4 lg:hidden">
        <div className="rounded-3xl bg-card p-4">
          <JobHeader job={detail.data.job} />
        </div>
        <div className="grid grid-cols-2 gap-1 rounded-full bg-card p-1" role="tablist">
          {(
            [
              ["candidats", `Candidats${count === undefined ? "" : ` (${count})`}`],
              ["offre", "Offre"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={cn(
                "rounded-full py-2.5 font-medium text-sm transition-colors",
                tab === value ? "bg-header text-header-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-8">
        <div className={cn("lg:sticky lg:top-6", tab !== "offre" && "max-lg:hidden")}>
          <div className="rounded-3xl bg-card p-5 sm:p-6">
            {/* The compact header already shows title and chips on phones. */}
            <JobSummary detail={detail.data} headerClassName="max-lg:hidden" />
          </div>
        </div>
        <div className={cn(tab !== "candidats" && "max-lg:hidden")}>
          <CandidatesList jobId={id} />
        </div>
      </div>
    </div>
  );
}
