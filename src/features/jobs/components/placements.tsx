"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { IconBrandWhatsapp, IconPhone, IconPhoneCall, IconUserCheck } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Button } from "#/components/ui/button";
import { usePlacements, useRevealPhone } from "#/hooks/use-candidates";
import { friendlyError } from "#/lib/api/friendly-error";
import type { ApplicationStatus, JobPlacement, PhoneReveal } from "#/lib/api/types";
import { cn, getInitials } from "#/lib/utils";
import { ActionDialog } from "./action-dialog";

const STATUS: Record<ApplicationStatus, { label: string; tone: string }> = {
  PENDING: { label: "En attente", tone: "bg-chip-amber text-chip-amber-foreground" },
  VIEWED: { label: "Vue par l'employeur", tone: "bg-chip-violet text-chip-violet-foreground" },
  WAITING_PAYMENT: { label: "Acceptée", tone: "bg-chip-green text-chip-green-foreground" },
  ACCEPTED: { label: "Acceptée", tone: "bg-chip-green text-chip-green-foreground" },
  STARTED: { label: "En cours", tone: "bg-chip-green text-chip-green-foreground" },
  END: { label: "Terminée", tone: "bg-muted text-muted-foreground" },
  REJECTED: { label: "Refusée", tone: "bg-destructive/10 text-destructive" },
  CANCELLED: { label: "Annulée", tone: "bg-muted text-muted-foreground" },
};

/**
 * The workers this agent placed on the job — directly, by invitation or by
 * number — and where each application stands. Hidden until there is one.
 */
export function Placements({ jobId }: Readonly<{ jobId: string }>) {
  const placements = usePlacements(jobId, true);
  const list = placements.data ?? [];
  if (list.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <h2 className="font-semibold text-lg">Mes placements</h2>
        <span className="text-muted-foreground text-sm tabular-nums">{list.length}</span>
      </div>
      <div className="flex flex-col divide-y divide-border/60 rounded-2xl bg-card">
        {list.map((p) => (
          <PlacementRow key={p.applicationId} placement={p} />
        ))}
      </div>
    </section>
  );
}

function PlacementRow({ placement: p }: Readonly<{ placement: JobPlacement }>) {
  const name = `${p.worker.firstName} ${p.worker.lastName}`.trim();
  const status = STATUS[p.status] ?? { label: p.status, tone: "bg-muted text-muted-foreground" };
  const queryClient = useQueryClient();
  const revealKey = ["reveal", p.leadId] as const;
  // Same cache as the candidate card: showing it again must not log another reveal.
  const revealed = useQuery<PhoneReveal>({
    queryKey: revealKey,
    queryFn: () => Promise.reject(new Error("not revealed")),
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  }).data;
  const reveal = useRevealPhone();
  const [confirming, setConfirming] = useState(false);
  const phone = revealed?.phone ?? revealed?.directPhone ?? null;

  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <Avatar className="size-11">
          {p.worker.avatarUrl && <AvatarImage src={p.worker.avatarUrl} alt={name} />}
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{name}</p>
          <p className="truncate text-muted-foreground text-xs">
            Placé(e) le {format(new Date(p.placedAt), "d MMM 'à' HH'h'mm", { locale: fr })}
            {p.worker.city ? ` · ${p.worker.city}` : ""}
          </p>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 font-medium text-xs", status.tone)}>
          {status.label}
        </span>
      </div>

      {p.leadId &&
        (revealed ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-page p-2 pl-4">
            <span className="mr-auto font-semibold tabular-nums tracking-wide">
              {phone ?? "Numéro non renseigné"}
            </span>
            {phone && (
              <>
                <Button size="sm" className="rounded-full" render={<a href={`tel:${phone}`} />}>
                  <IconPhoneCall />
                  Appeler
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-full bg-card"
                  render={
                    <a href={`https://wa.me/${phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" />
                  }
                >
                  <IconBrandWhatsapp />
                  WhatsApp
                </Button>
              </>
            )}
          </div>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            className="self-start rounded-full"
            onClick={() => setConfirming(true)}
          >
            <IconPhone />
            Voir le numéro
          </Button>
        ))}

      <ActionDialog
        open={confirming}
        onOpenChange={setConfirming}
        icon={<IconUserCheck className="size-5" />}
        title={`Voir le numéro de ${p.worker.firstName} ?`}
        description="Pour suivre ce placement. La consultation est enregistrée et compte dans votre limite du jour, sauf si vous avez déjà vu ce numéro aujourd'hui."
        confirmLabel="Voir le numéro"
        pending={reveal.isPending}
        onConfirm={() =>
          p.leadId &&
          reveal.mutate(p.leadId, {
            onSuccess: (result) => {
              queryClient.setQueryData(revealKey, result);
              setConfirming(false);
            },
            onError: (err) => {
              setConfirming(false);
              toast.error(friendlyError(err, "Impossible d'afficher ce numéro."));
            },
          })
        }
      />
    </div>
  );
}
