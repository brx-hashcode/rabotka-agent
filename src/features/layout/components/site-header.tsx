"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "#/components/ui/button";
import { useSession } from "#/app/providers/session-context";
import { cn } from "#/lib/utils";
import { AgentMenu } from "./agent-menu";

const NAV = [{ href: "/", label: "Offres", match: (p: string) => p === "/" || p.startsWith("/jobs") }];

/**
 * The black band the mockup opens with. On "/" the feed hero continues it.
 * "Se connecter" is a soft link to /auth/sign-in, which the `@modal` slot
 * intercepts into the dialog; `next` brings the agent back here afterwards.
 */
export function SiteHeader() {
  const { isAuthenticated } = useSession();
  const pathname = usePathname();
  const signInHref =
    pathname === "/"
      ? "/auth/sign-in"
      : `/auth/sign-in?next=${encodeURIComponent(pathname)}`;

  return (
    <header className="bg-header text-header-foreground">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold">
          <Image
            src="/rabotka-logo.png"
            alt=""
            width={32}
            height={32}
            className="rounded-lg"
            priority
          />
          <span className="text-[15px]">
            Rabotka <span className="font-normal text-header-muted">Agent</span>
          </span>
        </Link>

        <nav className="hidden h-full items-stretch gap-8 sm:flex" aria-label="Navigation">
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center font-medium text-sm transition-colors",
                  active ? "text-whatsapp" : "text-header-muted hover:text-header-foreground",
                )}
              >
                {active && (
                  <span className="absolute inset-x-0 top-0 h-0.5 rounded-b bg-whatsapp" />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <AgentMenu />
          ) : (
            <Button
              render={<Link href={signInHref} scroll={false} />}
              className="rounded-full px-5"
            >
              Se connecter
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
