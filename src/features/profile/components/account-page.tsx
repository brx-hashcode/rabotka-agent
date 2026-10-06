"use client";

import { IconMapPin, IconWallet } from "@tabler/icons-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";

import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { useAgentMe } from "#/hooks/use-agent-me";
import { useWallet } from "#/hooks/use-account";
import { friendlyError } from "#/lib/api/friendly-error";
import { cn, formatXAF, getInitials } from "#/lib/utils";
import { OverviewTab } from "./overview-tab";
import { PlacementsTab } from "./placements-tab";
import { ProfileTab } from "./profile-tab";
import { WalletTab } from "./wallet-tab";

export const ACCOUNT_TABS = ["apercu", "portefeuille", "placements", "profil"] as const;
export type AccountTab = (typeof ACCOUNT_TABS)[number];

const TAB_LABELS: Record<AccountTab, string> = {
  apercu: "Aperçu",
  portefeuille: "Portefeuille",
  placements: "Placements",
  profil: "Profil",
};

/**
 * The agent's own space: how they are doing, their money, the workers they
 * placed, and the account Rabotka holds for them. The tab lives in the URL so
 * the header menu can link straight to the wallet.
 */
export function AccountPage() {
  const me = useAgentMe();
  const { wallet } = useWallet();
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral(ACCOUNT_TABS).withDefault("apercu"),
  );

  if (me.isError) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl bg-card p-8 text-center text-muted-foreground text-sm">
          {friendlyError(me.error, "Impossible de charger votre compte.")}
        </div>
      </div>
    );
  }

  const agent = me.data;
  const name = agent ? `${agent.firstName} ${agent.lastName}`.trim() : "";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Avatar className="size-16 shrink-0 sm:size-20">
            {agent?.avatarUrl && <AvatarImage src={agent.avatarUrl} alt={name} />}
            <AvatarFallback className="bg-whatsapp/15 font-semibold text-whatsapp-dark text-xl">
              {agent ? getInitials(name) : ""}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1.5">
            {agent ? (
              <h1 className="truncate font-semibold text-2xl tracking-tight sm:text-3xl">{name}</h1>
            ) : (
              <div className="h-8 w-48 animate-pulse rounded-lg bg-card" />
            )}
            <div className="flex flex-wrap items-center gap-1.5 text-muted-foreground text-sm">
              <span>Agent Rabotka</span>
              {agent?.zones.map((z) => (
                <span
                  key={`${z.countryCode}-${z.city}`}
                  className="inline-flex items-center gap-1 rounded-full bg-chip-green px-2 py-0.5 font-medium text-chip-green-foreground text-xs"
                >
                  <IconMapPin className="size-3" />
                  {z.city}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void setTab("portefeuille")}
          className={cn(
            "flex items-center gap-3 rounded-2xl bg-card px-4 py-3 text-left transition-colors hover:bg-card/80",
            // The wallet tab shows the balance in full already.
            tab === "portefeuille" && "max-sm:hidden",
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-header text-header-foreground">
            <IconWallet className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-muted-foreground text-xs">Disponible</span>
            <span className="block font-semibold text-lg tabular-nums">
              {wallet ? formatXAF(wallet.balance.available) : "—"}
            </span>
          </span>
        </button>
      </header>

      <nav
        aria-label="Sections du compte"
        className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0"
      >
        {ACCOUNT_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => void setTab(t)}
            aria-current={tab === t ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-3 py-2 font-medium text-sm transition-colors sm:px-4",
              tab === t
                ? "bg-ink text-white"
                : "text-muted-foreground hover:bg-card hover:text-foreground",
            )}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </nav>

      {tab === "apercu" && <OverviewTab onOpen={(t) => void setTab(t)} />}
      {tab === "portefeuille" && <WalletTab />}
      {tab === "placements" && <PlacementsTab />}
      {tab === "profil" && <ProfileTab />}
    </div>
  );
}
