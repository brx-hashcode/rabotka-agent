"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  IconBrandWhatsapp,
  IconCheck,
  IconCopy,
  IconEye,
  IconLock,
  IconPhone,
  IconPhoneCall,
  IconUserCheck,
} from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Button } from "#/components/ui/button";
import { usePlacements, useRevealPhone } from "#/hooks/use-candidates";
import { friendlyError } from "#/lib/api/friendly-error";
import { copyText } from "#/lib/clipboard";
import type { JobPlacement, PhoneReveal } from "#/lib/api/types";
import { cn, getInitials } from "#/lib/utils";
import { applicationStatus } from "#/features/jobs/application-status";
import { ActionDialog } from "./action-dialog";

/**
 * The workers this agent placed on the job — directly, by invitation or by
 * number — and where each application stands. Hidden until there is one,
 * unless `showEmpty` keeps its column filled.
 */
export function Placements({ jobId, showEmpty = false }: Readonly<{ jobId: string; showEmpty?: boolean }>) {
  const placements = usePlacements(jobId, true);
  const list = placements.data ?? [];
  if (list.length === 0) {
    if (!showEmpty || placements.isPending) return null;
    return (
      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-lg">Mes placements</h2>
        <p className="rounded-2xl bg-card px-5 py-8 text-center text-muted-foreground text-sm">
          Pas encore de placement sur cette offre.
        </p>
      </section>
    );
  }

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
  const status = applicationStatus(p.status, p.rejectionSource);
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

      {p.leadId && (
        <div className="flex flex-col gap-3 rounded-2xl bg-page p-3 sm:ml-14 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                revealed ? "bg-chip-green text-chip-green-foreground" : "bg-card text-muted-foreground",
              )}
            >
              {revealed ? <IconPhone className="size-5" /> : <IconLock className="size-5" />}
            </span>
            <div className="min-w-0 flex-1">
              {revealed ? (
                <>
                  <p className="text-muted-foreground text-xs">Numéro de {p.worker.firstName}</p>
                  <div className="flex items-center gap-1">
                    <p className="truncate font-semibold tabular-nums tracking-wide">
                      {phone ?? "Non renseigné"}
                    </p>
                    {phone && <CopyButton value={phone} />}
                  </div>
                </>
              ) : (
                <>
                  <p className="font-medium text-sm">Numéro masqué</p>
                  <p className="text-muted-foreground text-xs">Visible pour suivre ce placement</p>
                </>
              )}
            </div>
          </div>

          {revealed ? (
            phone && (
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <Button className="rounded-full bg-ink text-white hover:bg-ink/90" render={<a href={`tel:${phone}`} />}>
                  <IconPhoneCall />
                  Appeler
                </Button>
                <Button
                  className="rounded-full bg-whatsapp text-white hover:bg-whatsapp/90"
                  render={
                    <a href={`https://wa.me/${phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" />
                  }
                >
                  <IconBrandWhatsapp />
                  WhatsApp
                </Button>
              </div>
            )
          ) : (
            <Button
              variant="secondary"
              className="rounded-full bg-card hover:bg-card/80"
              onClick={() => setConfirming(true)}
            >
              <IconEye />
              Voir le numéro
            </Button>
          )}
        </div>
      )}

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

function CopyButton({ value }: Readonly<{ value: string }>) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label="Copier le numéro"
      onClick={async () => {
        if (!(await copyText(value))) return;
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-card hover:text-foreground"
    >
      {copied ? <IconCheck className="size-4 text-whatsapp-dark" /> : <IconCopy className="size-4" />}
    </button>
  );
}
