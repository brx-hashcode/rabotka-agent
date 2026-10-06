"use client";

import {
  IconInfoCircle,
  IconLogout,
  IconMail,
  IconMapPin,
  IconPhone,
  IconShieldCheck,
  type Icon,
} from "@tabler/icons-react";

import { Button } from "#/components/ui/button";
import { useAgentMe } from "#/hooks/use-agent-me";
import { useLogoutMutation } from "#/hooks/use-auth-mutations";
import { cn } from "#/lib/utils";

const STATUS: Record<string, { label: string; tone: string }> = {
  ACTIVE: { label: "Actif", tone: "bg-chip-green text-chip-green-foreground" },
  SUSPENDED: { label: "Suspendu", tone: "bg-chip-amber text-chip-amber-foreground" },
  REVOKED: { label: "Désactivé", tone: "bg-destructive/10 text-destructive" },
};

/**
 * The agent's account as Rabotka holds it. Read-only: agents are created and
 * edited by an admin (photo, identity, zones), so changes go through them.
 * Sign-out is here as well as in the header menu.
 */
export function ProfileTab() {
  const me = useAgentMe();
  const logout = useLogoutMutation();

  if (!me.data) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-3xl bg-card" />
        <div className="h-64 animate-pulse rounded-3xl bg-card" />
      </div>
    );
  }
  const agent = me.data;
  const status = STATUS[agent.status] ?? { label: agent.status, tone: "bg-muted text-muted-foreground" };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="flex flex-col gap-4 rounded-3xl bg-card p-5 sm:p-6">
        <SectionTitle title="Coordonnées" hint="Votre identifiant de connexion et votre numéro Mobile Money par défaut." />
        <dl className="flex flex-col divide-y divide-border/60">
          <Row icon={IconMail} label="Email">
            <span className="truncate">{agent.email}</span>
          </Row>
          <Row icon={IconPhone} label="Téléphone">
            <span className={cn("truncate", !agent.phone && "text-muted-foreground")}>
              {agent.phone ?? "Non renseigné"}
            </span>
          </Row>
          <Row icon={IconShieldCheck} label="Statut du compte">
            <span className={cn("rounded-full px-2.5 py-1 font-medium text-xs", status.tone)}>
              {status.label}
            </span>
          </Row>
        </dl>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl bg-card p-5 sm:p-6">
        <SectionTitle
          title="Zones de travail"
          hint={
            agent.zones.length > 0
              ? `Vous voyez les offres ${agent.zones.length > 1 ? "de ces villes" : "de cette ville"} et y placez des travailleurs.`
              : "Aucune zone assignée pour le moment."
          }
        />
        {agent.zones.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {agent.zones.map((z) => (
              <span
                key={`${z.countryCode}-${z.city}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-chip-green px-3.5 py-2 font-medium text-chip-green-foreground text-sm"
              >
                <IconMapPin className="size-4" />
                {z.city}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="flex items-start gap-3 rounded-3xl bg-card p-5 sm:p-6 lg:col-span-2">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-page text-muted-foreground">
          <IconInfoCircle className="size-5" />
        </span>
        <div className="space-y-1">
          <p className="font-semibold">Une information à corriger ?</p>
          <p className="text-muted-foreground text-sm">
            Votre photo, vos coordonnées et vos zones sont gérées par l&apos;équipe Rabotka.
            Contactez-la pour les modifier.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-3xl bg-card p-5 sm:flex-row sm:items-center sm:p-6 lg:col-span-2">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-page text-muted-foreground">
          <IconLogout className="size-5" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-semibold">Session</p>
          <p className="truncate text-muted-foreground text-sm">Connecté(e) en tant que {agent.email}</p>
        </div>
        <Button
          variant="secondary"
          className="rounded-full"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          <IconLogout />
          Se déconnecter
        </Button>
      </section>
    </div>
  );
}

function SectionTitle({ title, hint }: Readonly<{ title: string; hint: string }>) {
  return (
    <div className="space-y-1">
      <h2 className="font-semibold">{title}</h2>
      <p className="text-muted-foreground text-xs">{hint}</p>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: Readonly<{ icon: Icon; label: string; children: React.ReactNode }>) {
  return (
    <div className="flex items-center gap-3 py-3 text-sm first:pt-0 last:pb-0">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-page text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="ml-auto flex min-w-0 justify-end font-medium">{children}</dd>
    </div>
  );
}
