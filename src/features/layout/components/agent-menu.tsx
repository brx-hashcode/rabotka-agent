"use client";

import Link from "next/link";
import { IconChevronDown, IconLogout, IconMapPin, IconUser } from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { useAgentMe } from "#/hooks/use-agent-me";
import { useLogoutMutation } from "#/hooks/use-auth-mutations";
import { getInitials } from "#/lib/utils";

/** The signed-in agent in the header: avatar, name, zones, sign-out. */
export function AgentMenu() {
  const { data: agent } = useAgentMe();
  const logout = useLogoutMutation();
  const name = agent ? `${agent.firstName} ${agent.lastName}`.trim() : "";

  const avatar = (size: string) => (
    <Avatar className={size}>
      {agent?.avatarUrl && <AvatarImage src={agent.avatarUrl} alt={name} />}
      <AvatarFallback className="bg-whatsapp/15 font-medium text-whatsapp-dark">
        {agent ? getInitials(name) : ""}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group flex items-center gap-2.5 rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ink/50 focus-visible:ring-offset-2 focus-visible:ring-offset-header sm:py-1 sm:pr-2 sm:pl-3 sm:hover:bg-black/5"
        aria-label="Mon compte"
      >
        {agent && (
          <span className="hidden min-w-0 flex-col items-end text-right leading-tight sm:flex">
            <span className="max-w-48 truncate font-medium text-sm">{name}</span>
            <span className="max-w-48 truncate text-header-muted text-xs">{agent.email}</span>
          </span>
        )}
        {avatar("size-9 ring-2 ring-black/10")}
        <IconChevronDown className="hidden size-4 text-header-muted transition-transform group-data-[state=open]:rotate-180 sm:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        // Closing by tap must not hand focus back to the trigger: on phones
        // that left a focus ring around the avatar.
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="w-80 rounded-3xl border-0 bg-card p-2 shadow-soft"
      >
        <div className="flex items-center gap-3 rounded-2xl bg-page p-3">
          {avatar("size-12")}
          <div className="min-w-0">
            <p className="truncate font-semibold">{name || "Agent"}</p>
            {agent && <p className="truncate text-muted-foreground text-sm">{agent.email}</p>}
          </div>
        </div>

        {agent && agent.zones.length > 0 && (
          <div className="space-y-2 px-3 pt-4 pb-3">
            <p className="font-medium text-muted-foreground text-xs">Vos zones</p>
            <div className="flex flex-wrap gap-1.5">
              {agent.zones.map((z) => (
                <span
                  key={`${z.countryCode}-${z.city}`}
                  className="inline-flex items-center gap-1 rounded-full bg-chip-green px-2.5 py-1 font-medium text-chip-green-foreground text-xs"
                >
                  <IconMapPin className="size-3.5" />
                  {z.city}
                </span>
              ))}
            </div>
          </div>
        )}

        <div aria-hidden className="mx-3 my-1 h-px bg-border/70" />

        <DropdownMenuItem asChild className="cursor-pointer gap-3 rounded-2xl px-3 py-2.5 text-sm focus:bg-page">
          <Link href="/profile">
            <span className="flex size-8 items-center justify-center rounded-full bg-page">
              <IconUser className="size-4" />
            </span>
            Mon profil
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => logout.mutate()}
          disabled={logout.isPending}
          className="cursor-pointer gap-3 rounded-2xl px-3 py-2.5 text-sm focus:bg-page"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-page">
            <IconLogout className="size-4" />
          </span>
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
