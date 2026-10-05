"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconBriefcase,
  IconCalendar,
  IconClock,
  IconFileDescription,
  IconHash,
  IconHome,
  IconLock,
  IconMapPin,
  IconShare,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "#/components/ui/button";
import { useJobCategories } from "#/hooks/use-job-categories";
import { useJobDetail, type JobDetailResult } from "#/hooks/use-job-detail";
import { friendlyError, httpStatusOf } from "#/lib/api/friendly-error";
import {
  EMPLOYMENT_TYPE_LABELS,
  PAYMENT_FLOW_LABELS,
  jobPlace,
  jobPlaceShort,
  jobStart,
  jobStartShort,
  postedAgo,
  seatsLabel,
} from "#/lib/job-labels";
import { cn, formatXAF } from "#/lib/utils";

type Variant = "page" | "panel";

/**
 * A job, for the side panel over the feed (full screen on phones) and for the
 * full /jobs/[id] page. Everyone sees the summary and the description;
 * signed-in agents also get pay and address for jobs in their zones.
 */
export function JobDetail({
  id,
  variant = "page",
}: Readonly<{
  id: string;
  /** "panel": inside the side panel — close button in the top bar. */
  variant?: Variant;
}>) {
  const detail = useJobDetail(id);
  const categories = useJobCategories();
  const jobPath = `/jobs/${id}`;

  if (detail.isPending) {
    return (
      <Shell variant={variant} jobPath={jobPath}>
        <JobDetailSkeleton />
      </Shell>
    );
  }

  if (detail.isError) {
    const notFound = httpStatusOf(detail.error) === 404;
    return (
      <Shell variant={variant} jobPath={jobPath}>
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="font-semibold">
            {notFound ? "Offre introuvable" : "Impossible de charger l'offre"}
          </p>
          <p className="max-w-xs text-muted-foreground text-sm">
            {notFound
              ? "Elle a été pourvue, retirée ou n'existe pas."
              : friendlyError(detail.error, "Réessayez dans un instant.")}
          </p>
          <Button variant="secondary" className="mt-3 rounded-full" render={<Link href="/" />}>
            Voir les offres ouvertes
          </Button>
        </div>
      </Shell>
    );
  }

  const { job } = detail.data;
  const agentJob = detail.data.kind === "agent" ? detail.data.job : null;
  const anonymous = detail.data.kind === "public" && !detail.data.outsideZones;
  const icon = categories.data?.find((c) => c.slug === job.category?.slug)?.icon;
  const startChip = jobStartShort(job.scheduledAt);

  const facts: { icon: typeof IconMapPin; label: string; value: string }[] = [
    {
      icon: IconBriefcase,
      label: "Contrat",
      value: EMPLOYMENT_TYPE_LABELS[job.employmentType] ?? job.employmentType,
    },
    { icon: IconMapPin, label: "Lieu", value: jobPlace(job) },
    ...(agentJob?.address
      ? [{ icon: IconHome, label: "Adresse", value: agentJob.address }]
      : []),
    {
      icon: IconCalendar,
      label: "Début",
      value: jobStart(job.scheduledAt)?.replace("Début le ", "") ?? "À convenir",
    },
    {
      icon: IconUsers,
      label: "Places",
      value: agentJob
        ? freeSeatsLabel(job.seatsLeft, agentJob.quantity)
        : seatsLabel(job.seatsLeft),
    },
    { icon: IconHash, label: "Référence", value: job.reference },
    { icon: IconClock, label: "Publiée", value: postedAgo(job.createdAt) },
  ];

  return (
    <Shell
      variant={variant}
      jobPath={jobPath}
      shareTitle={job.title}
      footer={
        anonymous ? (
          <Button
            size="xl"
            className="w-full rounded-full"
            render={
              <Link href={`/auth/sign-in?next=${encodeURIComponent(jobPath)}`} scroll={false} />
            }
          >
            Se connecter pour voir la rémunération
          </Button>
        ) : null
      }
    >
      <article className="flex flex-col gap-6">
        <header className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <span
              aria-hidden
              className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-page text-2xl"
            >
              {icon ?? "💼"}
            </span>
            <div className="min-w-0 space-y-1 pt-0.5">
              <h1 className="font-semibold text-xl leading-snug tracking-tight sm:text-2xl">
                {job.title}
              </h1>
              <p className="text-muted-foreground text-sm">
                {job.category?.name ?? "Sans catégorie"}
                <span className="mx-1.5">•</span>
                <span className={cn(job.seatsLeft <= 0 && "text-destructive")}>
                  {seatsLabel(job.seatsLeft)}
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Chip tone="violet">
              {EMPLOYMENT_TYPE_LABELS[job.employmentType] ?? job.employmentType}
            </Chip>
            <Chip tone="green">{jobPlaceShort(job)}</Chip>
            {startChip && <Chip tone="amber">{startChip}</Chip>}
          </div>
        </header>

        <PayBlock detail={detail.data} />

        <section className="space-y-2">
          <h2 className="font-semibold text-sm">Détails</h2>
          <dl className="divide-y divide-card overflow-hidden rounded-2xl bg-page">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 px-4 py-3 text-sm">
                <dt className="flex w-28 shrink-0 items-center gap-2 text-muted-foreground">
                  <Icon className="size-4 shrink-0" />
                  {label}
                </dt>
                <dd className="min-w-0 flex-1 wrap-break-word text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-sm">Description</h2>
          {job.description?.trim() ? (
            <p className="whitespace-pre-line rounded-2xl bg-page px-4 py-4 text-sm leading-relaxed">
              {job.description.trim()}
            </p>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl bg-page px-4 py-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-muted-foreground">
                <IconFileDescription className="size-4.5" />
              </span>
              <div>
                <p className="font-medium text-sm">Pas encore de description</p>
                <p className="text-muted-foreground text-xs">
                  L&apos;employeur n&apos;a rien précisé pour le moment.
                </p>
              </div>
            </div>
          )}
        </section>
      </article>
    </Shell>
  );
}

function freeSeatsLabel(seatsLeft: number, quantity: number): string {
  const free = Math.min(Math.max(seatsLeft, 0), quantity);
  return `${free} libre${free > 1 ? "s" : ""} sur ${quantity}`;
}

/**
 * Top bar (back or close, and share), the content, and an optional footer.
 * In the panel the bars stick to the top and bottom of its scroll area.
 */
function Shell({
  variant,
  jobPath,
  shareTitle,
  footer,
  children,
}: Readonly<{
  variant: Variant;
  jobPath: string;
  shareTitle?: string;
  footer?: ReactNode;
  children: ReactNode;
}>) {
  const router = useRouter();
  const panel = variant === "panel";

  async function share() {
    const url = `${globalThis.location.origin}${jobPath}`;
    if (navigator.share) {
      await navigator.share({ title: shareTitle, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success("Lien de l'offre copié");
  }

  const roundButton =
    "inline-flex size-10 items-center justify-center rounded-full bg-page text-foreground transition-colors hover:bg-muted";

  return (
    <div className="flex flex-1 flex-col">
      <div
        className={cn(
          "flex items-center justify-between gap-3 pb-4",
          panel && "sticky top-0 z-10 -mx-4 bg-card/95 px-4 pt-3 backdrop-blur md:-mx-8 md:px-8 md:pt-5",
        )}
      >
        {panel ? (
          <button type="button" onClick={() => router.back()} className={roundButton} aria-label="Fermer">
            <IconArrowLeft className="size-5 md:hidden" />
            <IconX className="hidden size-5 md:block" />
          </button>
        ) : (
          <Link
            href="/"
            className="-ml-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-muted-foreground text-sm hover:bg-page hover:text-foreground"
          >
            <IconArrowLeft className="size-4" />
            Toutes les offres
          </Link>
        )}
        {shareTitle && (
          <button type="button" onClick={() => void share()} className={roundButton} aria-label="Partager l'offre">
            <IconShare className="size-4.5" />
          </button>
        )}
      </div>

      <div className="flex-1 pb-8">{children}</div>

      {footer && (
        <div
          className={cn(
            "pb-5",
            panel && "sticky bottom-0 -mx-4 bg-card/95 px-4 pt-3 backdrop-blur md:-mx-8 md:px-8",
          )}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

/** Pay for agents; otherwise why the visitor sees only the summary. */
function PayBlock({ detail }: Readonly<{ detail: JobDetailResult }>) {
  if (detail.kind === "agent") {
    const { amount, paymentFlow } = detail.job;
    return (
      <div className="rounded-2xl bg-chip-green px-4 py-4">
        <p className="text-chip-green-foreground text-xs">Rémunération</p>
        {amount === null ? (
          <p className="mt-1 font-semibold text-lg">À définir</p>
        ) : (
          <p className="mt-1">
            <span className="font-bold text-2xl tracking-tight">{formatXAF(amount)}</span>
            {paymentFlow && (
              <span className="ml-1.5 whitespace-nowrap text-muted-foreground text-sm">
                {PAYMENT_FLOW_LABELS[paymentFlow]}
              </span>
            )}
          </p>
        )}
      </div>
    );
  }

  if (detail.outsideZones) {
    return (
      <p className="rounded-2xl bg-chip-amber px-4 py-3.5 text-chip-amber-foreground text-sm">
        Cette offre est hors de vos zones : vous en voyez le résumé public.
      </p>
    );
  }

  return (
    <p className="flex items-center gap-2.5 rounded-2xl bg-page px-4 py-3.5 text-muted-foreground text-sm">
      <IconLock className="size-4 shrink-0" />
      La rémunération et l&apos;adresse sont réservées aux agents Rabotka.
    </p>
  );
}

const TONES = {
  violet: "bg-chip-violet text-chip-violet-foreground",
  green: "bg-chip-green text-chip-green-foreground",
  amber: "bg-chip-amber text-chip-amber-foreground",
} as const;

function Chip({ tone, children }: Readonly<{ tone: keyof typeof TONES; children: ReactNode }>) {
  return (
    <span className={cn("rounded-md px-2 py-0.5 font-medium text-xs", TONES[tone])}>
      {children}
    </span>
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
      <div className="h-20 animate-pulse rounded-2xl bg-muted" />
      <div className="h-64 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
