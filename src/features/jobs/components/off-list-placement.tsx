"use client";

import { useState } from "react";
import {
  IconAlertTriangle,
  IconBrandWhatsapp,
  IconUserPlus,
  IconUserSearch,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import { useLookupWorker, usePlaceByPhone } from "#/hooks/use-candidates";
import { friendlyError } from "#/lib/api/friendly-error";
import type { WorkerLookup } from "#/lib/api/types";
import { dialCode, toInternational } from "#/lib/phone";
import { getInitials } from "#/lib/utils";
import { ActionDialog } from "./action-dialog";

/**
 * Placing a worker the agent reached outside the suggestions: the agent types
 * the WhatsApp number the worker gave them, checks it is the right person,
 * confirms the worker agreed, and places them — the same placement as for a
 * suggested worker.
 */
export function OffListPlacement({
  jobId,
  countryCode,
}: Readonly<{ jobId: string; countryCode: string | null }>) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [found, setFound] = useState<WorkerLookup | null>(null);
  const [agreed, setAgreed] = useState(false);
  const lookup = useLookupWorker(jobId);
  const place = usePlaceByPhone(jobId);

  const number = toInternational(phone, countryCode);
  const validNumber = /^\+\d{8,15}$/.test(number);
  const name = found ? `${found.worker.firstName} ${found.worker.lastInitial}.`.trim() : "";

  function reset() {
    setPhone("");
    setFound(null);
    setAgreed(false);
    lookup.reset();
  }

  function search() {
    if (!validNumber || lookup.isPending) return;
    lookup.mutate(number, { onSuccess: setFound });
  }

  function confirmPlace() {
    place.mutate(number, {
      onSuccess: (result) => {
        setOpen(false);
        reset();
        toast.success(
          result.sentToWorker
            ? `${name} est placé(e) sur l'offre et en a été informé(e) sur WhatsApp.`
            : `${name} est placé(e) sur l'offre. Prévenez-le ou la directement.`,
        );
      },
      onError: (err) => toast.error(friendlyError(err, "Impossible de placer ce travailleur.")),
    });
  }

  return (
    <>
      <div className="flex flex-col items-start gap-3 rounded-2xl bg-card p-4 sm:flex-row sm:items-center sm:p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-chip-green text-chip-green-foreground">
          <IconUserSearch className="size-5" />
        </span>
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="font-medium">Un travailleur hors de cette liste ?</p>
          <p className="text-muted-foreground text-sm">
            S&apos;il accepte l&apos;offre, placez-le avec son numéro WhatsApp.
          </p>
        </div>
        <Button
          size="lg"
          variant="secondary"
          className="w-full rounded-full sm:w-auto"
          onClick={() => setOpen(true)}
        >
          <IconBrandWhatsapp />
          Placer par numéro
        </Button>
      </div>

      <ActionDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) reset();
        }}
        icon={found ? <IconUserPlus className="size-5" /> : <IconBrandWhatsapp className="size-5" />}
        tone={found?.blocker ? "warning" : "default"}
        title={found ? `Placer ${name} sur l'offre ?` : "Placer un travailleur par son numéro"}
        description={
          found
            ? `Une candidature est créée au nom de ${name} pour cette offre, et le placement vous est attribué. ${name} en est informé(e) par WhatsApp.`
            : "Saisissez le numéro WhatsApp que le travailleur vous a donné. Rabotka retrouve son profil."
        }
        confirmLabel={found ? "Placer" : "Rechercher"}
        pending={lookup.isPending || place.isPending}
        confirmDisabled={found ? !!found.blocker || !agreed : !validNumber}
        onConfirm={found ? confirmPlace : search}
      >
        {found ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-page p-3">
              <Avatar className="size-12">
                {found.worker.avatarUrl && <AvatarImage src={found.worker.avatarUrl} alt={name} />}
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{name}</p>
                <p className="truncate text-muted-foreground text-sm">
                  {number}
                  {found.worker.city ? ` · ${found.worker.city}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={reset}
                disabled={place.isPending}
                className="shrink-0 rounded-full px-3 py-1.5 text-muted-foreground text-xs transition-colors hover:bg-card hover:text-foreground"
              >
                Changer
              </button>
            </div>

            {found.blocker ? (
              <p className="flex items-start gap-2 rounded-2xl bg-chip-amber px-4 py-3 text-chip-amber-foreground text-sm">
                <IconAlertTriangle className="mt-0.5 size-4 shrink-0" />
                {found.blocker}
              </p>
            ) : (
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-chip-amber px-4 py-3 text-chip-amber-foreground text-sm">
                <Checkbox
                  checked={agreed}
                  onCheckedChange={(v) => setAgreed(v === true)}
                  className="mt-0.5"
                />
                <span>
                  {name} a accepté d&apos;être placé(e) sur cette offre et m&apos;a donné son
                  numéro.
                </span>
              </label>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="flex h-12 items-center gap-2 rounded-2xl bg-page px-4 focus-within:ring-2 focus-within:ring-ink/30">
              <IconBrandWhatsapp className="size-5 shrink-0 text-whatsapp-dark" />
              <input
                type="tel"
                inputMode="tel"
                autoComplete="off"
                autoFocus
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  lookup.reset();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    search();
                  }
                }}
                placeholder={`+${dialCode(countryCode)} 06 123 45 67`}
                aria-label="Numéro WhatsApp du travailleur"
                className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
            </label>
            {lookup.isError ? (
              <p className="px-1 text-destructive text-sm">
                {friendlyError(lookup.error, "Impossible de rechercher ce numéro.")}
              </p>
            ) : (
              phone.trim() !== "" &&
              validNumber && <p className="px-1 text-muted-foreground text-xs">Recherche : {number}</p>
            )}
          </div>
        )}
      </ActionDialog>
    </>
  );
}
