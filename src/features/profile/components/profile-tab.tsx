"use client";

import { IconLogout, IconMail, IconMapPin, IconPhone, IconShieldCheck } from "@tabler/icons-react";

import { Button } from "#/components/ui/button";
import { useAgentMe } from "#/hooks/use-agent-me";
import { useLogoutMutation } from "#/hooks/use-auth-mutations";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Actif",
  SUSPENDED: "Suspendu",
  INACTIVE: "Inactif",
};

/**
 * The agent's account as Rabotka holds it. Read-only: agents are created and
 * edited by an admin (photo, identity, zones), so changes go through them.
 */
export function ProfileTab() {
  const me = useAgentMe();
  const logout = useLogoutMutation();

  if (!me.data) return <div className="h-96 animate-pulse rounded-3xl bg-card" />;
  const agent = me.data;

  return (
    <div className="flex max-w-2xl flex-col gap-6 rounded-3xl bg-card p-5 shadow-soft sm:p-8">
      <section className="space-y-2">
        <h2 className="font-semibold text-sm">Coordonnées</h2>
        <dl className="divide-y divide-card overflow-hidden rounded-2xl bg-page">
          {[
            { icon: IconMail, label: "Email", value: agent.email },
            { icon: IconPhone, label: "Téléphone", value: agent.phone ?? "Non renseigné" },
            {
              icon: IconShieldCheck,
              label: "Compte",
              value: STATUS_LABELS[agent.status] ?? agent.status,
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
        {agent.zones.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {agent.zones.map((z) => (
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
        Pour modifier votre photo, vos informations ou vos zones, contactez l&apos;équipe Rabotka.
      </p>

      <Button
        variant="secondary"
        className="self-start rounded-full"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
      >
        <IconLogout />
        Se déconnecter
      </Button>
    </div>
  );
}
