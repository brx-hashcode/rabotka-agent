"use client";

import Link from "next/link";
import {
  IconArrowLeft,
  IconMail,
  IconMapPin,
  IconPhone,
  IconShieldCheck,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { useAgentMe } from "#/hooks/use-agent-me";
import { friendlyError } from "#/lib/api/friendly-error";
import { getInitials } from "#/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Actif",
  SUSPENDED: "Suspendu",
  INACTIVE: "Inactif",
};

/**
 * The agent's account as Rabotka holds it. Read-only: agents are created and
 * edited by an admin (photo, identity, zones), so changes go through them.
 */
export function AgentProfile() {
  const me = useAgentMe();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <Link
        href="/"
        className="-ml-2 mb-5 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-muted-foreground text-sm transition-colors hover:bg-card hover:text-foreground"
      >
        <IconArrowLeft className="size-4" />
        Toutes les offres
      </Link>

      {me.isPending && <div className="h-96 animate-pulse rounded-3xl bg-card" />}

      {me.isError && (
        <div className="rounded-3xl bg-card p-8 text-center text-muted-foreground text-sm">
          {friendlyError(me.error, "Impossible de charger votre profil.")}
        </div>
      )}

      {me.data && (
        <div className="flex flex-col gap-6 rounded-3xl bg-card p-5 sm:p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <Avatar className="size-24">
              {me.data.avatarUrl && (
                <AvatarImage
                  src={me.data.avatarUrl}
                  alt={`${me.data.firstName} ${me.data.lastName}`}
                />
              )}
              <AvatarFallback className="bg-whatsapp/15 font-semibold text-2xl text-whatsapp-dark">
                {getInitials(`${me.data.firstName} ${me.data.lastName}`)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h1 className="font-semibold text-2xl tracking-tight">
                {me.data.firstName} {me.data.lastName}
              </h1>
              <p className="text-muted-foreground text-sm">Agent Rabotka</p>
            </div>
          </div>

          <section className="space-y-2">
            <h2 className="font-semibold text-sm">Coordonnées</h2>
            <dl className="divide-y divide-card overflow-hidden rounded-2xl bg-page">
              {[
                { icon: IconMail, label: "Email", value: me.data.email },
                { icon: IconPhone, label: "Téléphone", value: me.data.phone ?? "Non renseigné" },
                {
                  icon: IconShieldCheck,
                  label: "Compte",
                  value: STATUS_LABELS[me.data.status] ?? me.data.status,
                },
              ].map(({ icon: Icon, label, value }) => (
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
            <h2 className="font-semibold text-sm">Vos zones</h2>
            {me.data.zones.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {me.data.zones.map((z) => (
                  <span
                    key={`${z.countryCode}-${z.city}`}
                    className="inline-flex items-center gap-1 rounded-full bg-chip-green px-3 py-1.5 font-medium text-chip-green-foreground text-sm"
                  >
                    <IconMapPin className="size-4" />
                    {z.city}
                  </span>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl bg-page px-4 py-3 text-muted-foreground text-sm">
                Aucune zone assignée pour le moment.
              </p>
            )}
          </section>

          <p className="rounded-2xl bg-page px-4 py-3 text-muted-foreground text-xs">
            Pour modifier votre photo, vos informations ou vos zones, contactez l&apos;équipe
            Rabotka.
          </p>
        </div>
      )}
    </div>
  );
}
