"use client";

import { format, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import {
  IconBrandWhatsapp,
  IconChevronDown,
  IconRosetteDiscountCheckFilled,
  IconLock,
  IconPhone,
  IconPhoneCall,
  IconStarFilled,
  IconUserSearch,
} from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import {
  useCandidates,
  useClaimLead,
  useLogCall,
  useRevealPhone,
} from "#/hooks/use-candidates";
import { friendlyError } from "#/lib/api/friendly-error";
import type { AgentCandidate, AgentLead, CallOutcome, PhoneReveal } from "#/lib/api/types";
import { cn, getInitials } from "#/lib/utils";

const OUTCOMES: { value: CallOutcome; label: string; closes?: boolean }[] = [
  { value: "INTERESTED", label: "Intéressé" },
  { value: "CALL_BACK", label: "À rappeler" },
  { value: "NOT_AVAILABLE", label: "Pas disponible pour cette date" },
  { value: "NOT_INTERESTED", label: "Pas intéressé", closes: true },
  { value: "UNREACHABLE", label: "Injoignable", closes: true },
  { value: "WRONG_NUMBER", label: "Mauvais numéro", closes: true },
];
const OUTCOME_LABEL = Object.fromEntries(OUTCOMES.map((o) => [o.value, o.label]));

/**
 * Workers the matcher suggests for a job, best first, and what this agent can
 * do with each: take them in charge (first agent wins), reveal their number
 * (claimer only, logged, capped per day), call or message them, record the
 * call. No contact detail is shown before the reveal.
 */
export function CandidatesList({ jobId }: Readonly<{ jobId: string }>) {
  const candidates = useCandidates(jobId, true);

  return (
    <section className="flex flex-col gap-4">
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <h2 className="font-semibold text-lg">Travailleurs suggérés</h2>
          {candidates.isSuccess && (
            <span className="text-muted-foreground text-sm tabular-nums">
              {candidates.data.length}
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm">
          Classés par compatibilité avec l&apos;offre. Prenez un travailleur en charge pour voir
          son numéro et l&apos;appeler.
        </p>
      </div>

      {candidates.isPending &&
        Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-2xl bg-card" />
        ))}

      {candidates.isError && (
        <div className="rounded-2xl bg-card p-8 text-center text-muted-foreground text-sm">
          {friendlyError(candidates.error, "Impossible de charger les travailleurs suggérés.")}
        </div>
      )}

      {candidates.isSuccess && candidates.data.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-10 text-center">
          <IconUserSearch className="size-8 text-muted-foreground" />
          <p className="font-medium">Aucun travailleur suggéré pour le moment</p>
          <p className="max-w-sm text-muted-foreground text-sm">
            Les profils vérifiés et compatibles apparaissent ici dès qu&apos;ils sont disponibles.
          </p>
        </div>
      )}

      {candidates.data?.map((c) => (
        <CandidateCard key={c.id} candidate={c} jobId={jobId} />
      ))}
    </section>
  );
}

function CandidateCard({
  candidate: c,
  jobId,
}: Readonly<{ candidate: AgentCandidate; jobId: string }>) {
  const name = `${c.firstName} ${c.lastName}`.trim();
  const match = Math.round(Math.min(Math.max(c.score, 0), 1) * 100);

  return (
    <article className="flex flex-col gap-4 rounded-2xl bg-card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <Avatar className="size-12">
          {c.avatarUrl && <AvatarImage src={c.avatarUrl} alt={name} />}
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-semibold">
            <span className="truncate">{name}</span>
            {c.verificationStatus === "VERIFIED" && (
              <IconRosetteDiscountCheckFilled className="size-4 shrink-0 text-whatsapp" aria-label="Vérifié" />
            )}
          </p>
          <p className="truncate text-muted-foreground text-sm">
            {[c.city, c.categories.slice(0, 2).join(", ")].filter(Boolean).join(" • ")}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-chip-green px-2.5 py-1 font-semibold text-chip-green-foreground text-xs tabular-nums">
          {match} %
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs">
        {c.ratingAvg !== null && c.ratingCount > 0 ? (
          <span className="flex items-center gap-1">
            <IconStarFilled className="size-3.5 text-amber-400" />
            <span className="font-medium text-foreground">{c.ratingAvg.toFixed(1)}</span>({c.ratingCount} avis)
          </span>
        ) : (
          <span>Pas encore d&apos;avis</span>
        )}
        {c.reliabilityScore !== null && <span>Fiabilité {Math.round(c.reliabilityScore)} %</span>}
      </div>

      {c.description?.trim() && (
        <p className="line-clamp-2 text-muted-foreground text-sm">{c.description.trim()}</p>
      )}

      {c.lead && <LeadActions lead={c.lead} jobId={jobId} workerName={c.firstName} />}
    </article>
  );
}

function LeadActions({
  lead,
  jobId,
  workerName,
}: Readonly<{ lead: AgentLead; jobId: string; workerName: string }>) {
  const claim = useClaimLead(jobId);

  if (lead.status === "CONFIRMED") {
    return <StatusLine tone="green">A postulé à l&apos;offre</StatusLine>;
  }

  if (lead.mine) {
    return <MyLead lead={lead} jobId={jobId} workerName={workerName} />;
  }

  if (!lead.available) {
    return (
      <StatusLine>
        <IconLock className="size-4" />
        Pris en charge par un autre agent
      </StatusLine>
    );
  }

  return (
    <Button
      size="lg"
      className="w-full rounded-full"
      loading={claim.isPending}
      onClick={() =>
        claim.mutate(lead.id, {
          onSuccess: () => toast.success(`${workerName} est à vous`),
          onError: (err) =>
            toast.error(friendlyError(err, "Impossible de prendre ce travailleur en charge.")),
        })
      }
    >
      Prendre en charge
    </Button>
  );
}

/** A lead this agent holds: reveal, call/WhatsApp, record the call. */
function MyLead({
  lead,
  jobId,
  workerName,
}: Readonly<{ lead: AgentLead; jobId: string; workerName: string }>) {
  const queryClient = useQueryClient();
  const revealKey = ["reveal", lead.id] as const;
  // Kept for the session: showing the number again must not log another reveal.
  const revealed = useQuery<PhoneReveal>({
    queryKey: revealKey,
    queryFn: () => Promise.reject(new Error("not revealed")),
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  }).data;
  const reveal = useRevealPhone();
  const logCall = useLogCall(jobId);

  const until = lead.claimExpiresAt ? new Date(lead.claimExpiresAt) : null;
  const untilLabel = until
    ? format(until, isToday(until) ? "HH'h'mm" : "d MMM 'à' HH'h'mm", { locale: fr })
    : null;
  const phone = revealed?.phone ?? revealed?.directPhone ?? null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-page p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        <span className="font-medium text-chip-green-foreground">
          {lead.status === "INVITED" ? "Invitation envoyée" : "Pris en charge par vous"}
          {untilLabel && lead.status === "CLAIMED" && (
            <span className="font-normal text-muted-foreground"> · jusqu&apos;à {untilLabel}</span>
          )}
        </span>
        {lead.lastCall && (
          <span className="text-muted-foreground">
            Dernier appel : {OUTCOME_LABEL[lead.lastCall.outcome] ?? lead.lastCall.outcome}
          </span>
        )}
      </div>

      {revealed ? (
        <div className="flex flex-col gap-3 rounded-xl bg-card p-3">
          <div className="space-y-0.5">
            <p className="whitespace-nowrap font-semibold text-xl tabular-nums tracking-wide">
              {phone ?? "Numéro non renseigné"}
            </p>
            <p className="text-muted-foreground text-xs">
              {revealed.revealsLeftToday > 0
                ? `Encore ${revealed.revealsLeftToday} numéro${revealed.revealsLeftToday > 1 ? "s" : ""} à consulter aujourd'hui`
                : "C'était votre dernier numéro pour aujourd'hui"}
            </p>
          </div>
          {revealed.directPhone && revealed.directPhone !== phone && (
            <p className="text-muted-foreground text-xs">Autre numéro : {revealed.directPhone}</p>
          )}
          {phone && (
            <div className="grid grid-cols-2 gap-2">
              <Button size="lg" className="rounded-full" render={<a href={`tel:${phone}`} />}>
                <IconPhoneCall />
                Appeler
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full"
                render={
                  <a href={`https://wa.me/${phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" />
                }
              >
                <IconBrandWhatsapp />
                WhatsApp
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Button
          size="lg"
          className="w-full rounded-full"
          loading={reveal.isPending}
          onClick={() =>
            reveal.mutate(lead.id, {
              onSuccess: (data) => queryClient.setQueryData(revealKey, data),
              onError: (err) => toast.error(friendlyError(err, "Impossible d'afficher le numéro.")),
            })
          }
        >
          <IconPhone />
          Voir le numéro de {workerName}
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            variant="ghost"
            className="w-full rounded-full bg-card"
            loading={logCall.isPending}
          >
            Résultat de l&apos;appel
            <IconChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-64">
          <DropdownMenuLabel>Comment s&apos;est passé l&apos;appel ?</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {OUTCOMES.map((o) => (
            <DropdownMenuItem
              key={o.value}
              className={cn(o.closes && "text-muted-foreground")}
              onSelect={() =>
                logCall.mutate(
                  { leadId: lead.id, outcome: o.value },
                  {
                    onSuccess: () =>
                      toast.success(
                        o.closes
                          ? `Appel enregistré : ${o.label.toLowerCase()}. ${workerName} sort des suggestions.`
                          : `Appel enregistré : ${o.label.toLowerCase()}.`,
                      ),
                    onError: (err) => toast.error(friendlyError(err, "Impossible d'enregistrer l'appel.")),
                  },
                )
              }
            >
              {o.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function StatusLine({
  tone,
  children,
}: Readonly<{ tone?: "green"; children: React.ReactNode }>) {
  return (
    <p
      className={cn(
        "flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm",
        tone === "green" ? "bg-chip-green text-chip-green-foreground" : "bg-page text-muted-foreground",
      )}
    >
      {children}
    </p>
  );
}
