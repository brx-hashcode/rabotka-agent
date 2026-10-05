"use client";

import { IconLogout, IconMapPin } from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { useAgentMe } from "#/hooks/use-agent-me";
import { useLogoutMutation } from "#/hooks/use-auth-mutations";
import { getInitials } from "#/lib/utils";

export function AgentMenu() {
  const { data: agent } = useAgentMe();
  const logout = useLogoutMutation();
  const name = agent ? `${agent.firstName} ${agent.lastName}` : "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Mon compte"
      >
        {agent && (
          <span className="hidden font-medium text-sm sm:inline">{name}</span>
        )}
        <Avatar className="size-9 ring-2 ring-white/10">
          {agent?.avatarUrl && <AvatarImage src={agent.avatarUrl} alt={name} />}
          <AvatarFallback>{agent ? getInitials(name) : ""}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="space-y-0.5">
          <p className="truncate font-medium">{name || "Agent"}</p>
          {agent && (
            <p className="truncate font-normal text-muted-foreground text-xs">
              {agent.email}
            </p>
          )}
        </DropdownMenuLabel>
        {agent && agent.zones.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="flex flex-wrap gap-1.5 px-2 py-1.5">
              {agent.zones.map((z) => (
                <span
                  key={`${z.countryCode}-${z.city}`}
                  className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs"
                >
                  <IconMapPin className="size-3" />
                  {z.city}
                </span>
              ))}
            </div>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => logout.mutate()}
          disabled={logout.isPending}
        >
          <IconLogout />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
