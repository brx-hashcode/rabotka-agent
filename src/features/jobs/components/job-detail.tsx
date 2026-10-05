"use client";

import Link from "next/link";
import {
  IconBriefcase,
  IconCalendar,
  IconClock,
  IconHash,
  IconLock,
  IconMapPin,
  IconUsers,
} from "@tabler/icons-react";

import { Button } from "#/components/ui/button";
import { useJobCategories } from "#/hooks/use-job-categories";
import { useJobDetail, type JobDetailResult } from "#/hooks/use-job-detail";
import { friendlyError, httpStatusOf } from "#/lib/api/friendly-error";
import {
  EMPLOYMENT_TYPE_LABELS,
  PAYMENT_FLOW_LABELS,
  jobPlace,
  jobStart,
  postedAgo,
  seatsLabel,
} from "#/lib/job-labels";
import { cn, formatXAF } from "#/lib/utils";

/**
 * A job, for the side panel over the feed and for the full /jobs/[id] page.
 * Everyone sees the public summary; signed-in agents also get pay, address
 * and description for jobs in their zones.
 */
export function JobDetail({ id }: Readonly<{ id: string }>) {
  const detail = useJobDetail(id);
  const categories = useJobCategories();

  if (detail.isPending) return <JobDetailSkeleton />;

  if (detail.isError) {
    const notFound = httpStatusOf(detail.error) === 404;
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="font-semibold">
          {notFound ? "Offre introuvable" : "Impossible de charger l'offre"}
        </p>
        <p className="max-w-xs text-muted-foreground text-sm">
          {notFound
            ? "Elle a été pourvue, retirée ou n'existe pas."
            : friendlyError(detail.error, "Réessayez dans un instant.")}
        </p>
        <Button variant="outline" className="mt-3 rounded-full" render={<Link href="/" />}>
          Voir les offres ouvertes
        </Button>
      </div>
    );
  }

  const { job } = detail.data;
  const agentJob = detail.data.kind === "agent" ? detail.data.job : null;
  const icon = categories.data?.find((c) => c.slug === job.category?.slug)?.icon;
  const start = jobStart(job.scheduledAt);

  const facts = [
    { icon: IconBriefcase, label: "Contrat", value: EMPLOYMENT_TYPE_LABELS[job.employmentType] ?? job.employmentType },
    { icon: IconMapPin, label: "Lieu", value: jobPlace(job) },
    { icon: IconCalendar, label: "Début", value: start?.replace("Début le ", "") ?? "À convenir" },
    {
      icon: IconUsers,
      label: "Places",
      value: agentJob ? `${seatsLabel(job.seatsLeft)} sur ${agentJob.quantity}` : seatsLabel(job.seatsLeft),
    },
    { icon: IconHash, label: "Référence", value: job.reference },
    { icon: IconClock, label: "Publiée", value: postedAgo(job.createdAt) },
  ];

  return (
    <article className="flex flex-col gap-6">
      <header className="flex items-start gap-4">
        <span
          aria-hidden
          className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-muted text-2xl"
        >
          {icon ?? "💼"}
        </span>
        <div className="min-w-0 space-y-1">
          <h1 className="font-semibold text-2xl leading-tight tracking-tight">{job.title}</h1>
          <p className="text-muted-foreground text-sm">
            {job.category?.name ?? "Sans catégorie"}
            <span className="mx-1.5">•</span>
            <span className={cn(job.seatsLeft <= 0 && "text-destructive")}>
              {seatsLabel(job.seatsLeft)}
            </span>
          </p>
        </div>
      </header>

      <AccessBlock detail={detail.data} />

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl bg-page px-4 py-3">
            <dt className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Icon className="size-3.5" />
              {label}
            </dt>
            <dd className="mt-1 break-words font-medium text-sm">{value}</dd>
          </div>
        ))}
      </dl>

      {agentJob?.address && (
        <section className="space-y-1.5">
          <h2 className="font-semibold text-sm">Adresse</h2>
          <p className="text-muted-foreground text-sm">{agentJob.address}</p>
        </section>
      )}

      {agentJob?.description && (
        <section className="space-y-1.5">
          <h2 className="font-semibold text-sm">Description</h2>
          <p className="whitespace-pre-line text-muted-foreground text-sm leading-relaxed">
            {agentJob.description}
          </p>
        </section>
      )}
    </article>
  );
}

/** Pay for agents; otherwise why the visitor sees only the summary. */
function AccessBlock({ detail }: Readonly<{ detail: JobDetailResult }>) {
  if (detail.kind === "agent") {
    const { amount, paymentFlow } = detail.job;
    return (
      <div className="flex items-baseline justify-between gap-3 rounded-2xl bg-chip-green px-5 py-4">
        <span className="text-chip-green-foreground text-sm">Rémunération</span>
        {amount === null ? (
          <span className="font-medium">À définir</span>
        ) : (
          <span>
            <span className="font-bold text-2xl">{formatXAF(amount)}</span>
            {paymentFlow && (
              <span className="text-muted-foreground text-sm">
                {" "}
                {PAYMENT_FLOW_LABELS[paymentFlow]}
              </span>
            )}
          </span>
        )}
      </div>
    );
  }

  if (detail.outsideZones) {
    return (
      <p className="rounded-2xl bg-chip-amber px-5 py-4 text-chip-amber-foreground text-sm">
        Cette offre est hors de vos zones : vous en voyez le résumé public.
      </p>
    );
  }

  const next = encodeURIComponent(`/jobs/${detail.job.id}`);
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-muted/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-2.5 text-sm">
        <IconLock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        Rémunération, adresse et description sont réservées aux agents Rabotka.
      </p>
      <Button
        className="shrink-0 rounded-full px-5"
        render={<Link href={`/auth/sign-in?next=${next}`} scroll={false} />}
      >
        Se connecter
      </Button>
    </div>
  );
}

function JobDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4">
        <div className="size-14 animate-pulse rounded-2xl bg-muted" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="h-16 animate-pulse rounded-2xl bg-muted" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
