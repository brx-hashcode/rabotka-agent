"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "#/components/brand-logo";
import { Button } from "#/components/ui/button";
import { useSession } from "#/app/providers/session-context";
import { AgentMenu } from "./agent-menu";

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
        <Link href="/" aria-label="Rabotka — accueil">
          <BrandLogo tone="dark" />
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <AgentMenu />
          ) : (
            <Button
              variant="ghost"
              render={<Link href={signInHref} scroll={false} />}
              className="rounded-full bg-ink px-5 text-white hover:bg-ink/90"
            >
              Se connecter
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
