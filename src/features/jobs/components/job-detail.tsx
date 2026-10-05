"use client";

import Link from "next/link";
import {
  IconArrowLeft,
  IconBriefcase,
  IconCalendar,
  IconCash,
  IconMapPin,
  IconUsers,
} from "@tabler/icons-react";

import { Button } from "#/components/ui/button";
import { Skeleton } from "#/components/ui/skeleton";
import { useAgentJob } from "#/hooks/use-agent-job";
import { friendlyError, httpStatusOf } from "#/lib/api/friendly-error";
import {
  EMPLOYMENT_TYPE_LABELS,
  PAYMENT_FLOW_LABELS,
  jobPlace,
  jobStart,
  postedAgo,
  seatsLabel,
} from "#/lib/job-labels";
import { formatXAF } from "#/lib/utils";

/** A job in the agent's zones (`GET agent/jobs/:id`). */
export function JobDetail({ id }: Readonly<{ id: string }>) {
  const job = useAgentJob(id);

  const back = (
    <Button variant="ghost" size="sm" render={<Link href="/" />} className="-ml-2 self-start">
      <IconArrowLeft />
      Toutes les offres
    </Button>
  );

  if (job.isPending) {
    return (
      <div className="flex flex-col gap-4">
        {back}
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (job.isError) {
    const notFound = httpStatusOf(job.error) === 404;
    return (
      <div className="flex flex-col gap-4">
        {back}
        <div className="rounded-2xl bg-card p-8 text-center shadow-soft">
          <p className="font-medium">
            {notFound ? "Offre introuvable" : "Impossible de charger l'offre"}
          </p>
          <p className="mt-1 text-muted-foreground text-sm">
            {notFound
              ? "Elle n'existe plus ou se trouve hors de vos zones."
              : friendlyError(job.error, "Réessayez dans un instant.")}
          </p>
        </div>
      </div>
    );
  }

  const j = job.data;
  const start = jobStart(j.scheduledAt);
  const facts = [
    { icon: IconMapPin, label: jobPlace(j) },
    { icon: IconBriefcase, label: EMPLOYMENT_TYPE_LABELS[j.employmentType] ?? j.employmentType },
    start && { icon: IconCalendar, label: start },
    { icon: IconUsers, label: `${seatsLabel(j.seatsLeft)} sur ${j.quantity}` },
    j.amount !== null && {
      icon: IconCash,
      label: `${formatXAF(j.amount)}${j.paymentFlow ? ` ${PAYMENT_FLOW_LABELS[j.paymentFlow]}` : ""}`,
    },
  ].filter(Boolean) as { icon: typeof IconMapPin; label: string }[];

  return (
    <div className="flex flex-col gap-4">
      {back}
      <article className="flex flex-col gap-5 rounded-2xl bg-card p-6 shadow-soft">
        <header className="space-y-1">
          <p className="text-muted-foreground text-xs">
            {j.category?.name ? `${j.category.name} · ` : ""}
            {j.reference}
          </p>
          <h1 className="font-bold text-2xl leading-tight">{j.title}</h1>
          <p className="text-muted-foreground text-xs">{postedAgo(j.createdAt)}</p>
        </header>

        <ul className="grid gap-2 sm:grid-cols-2">
          {facts.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2 text-sm">
              <Icon className="size-4 text-muted-foreground" />
              {label}
            </li>
          ))}
        </ul>

        {j.address && (
          <section className="space-y-1">
            <h2 className="font-medium text-sm">Adresse</h2>
            <p className="text-muted-foreground text-sm">{j.address}</p>
          </section>
        )}

        {j.description && (
          <section className="space-y-1">
            <h2 className="font-medium text-sm">Description</h2>
            <p className="whitespace-pre-line text-muted-foreground text-sm">
              {j.description}
            </p>
          </section>
        )}
      </article>
    </div>
  );
}
