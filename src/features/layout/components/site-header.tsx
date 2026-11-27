"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "#/components/brand-logo";
import { Button } from "#/components/ui/button";
import { useSession } from "#/app/providers/session-context";
import { NotificationBell } from "#/features/notifications/components/notification-bell";
import { AgentMenu } from "./agent-menu";
import { ThemeButton } from "#/components/theme-toggle";

/**
 * The lime band the page opens with, lime in both themes. On "/" the feed
 * hero continues it. The sun/moon switches the theme, signed in or not.
 * "Se connecter" goes to /auth/sign-in; `next` brings the agent back here
 * afterwards.
 */
export function SiteHeader() {
  const { isAuthenticated } = useSession();
  const pathname = usePathname();
  const signInHref =
    pathname === "/"
      ? "/auth/sign-in"
      : `/auth/sign-in?next=${encodeURIComponent(pathname)}`;

  return (
    // Stays at the top while the page scrolls, under the iPhone status bar
    // strip of the root layout; 4rem tall (pages offset their own sticky
    // parts by it).
    <header className="sticky top-[env(safe-area-inset-top)] z-40 bg-header text-header-foreground">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" aria-label="Rabotka — accueil">
          <BrandLogo tone="dark" />
        </Link>

        <div className="flex items-center gap-3">
          <ThemeButton />
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <AgentMenu />
            </>
          ) : (
            <Button
              variant="ghost"
              render={<Link href={signInHref} scroll={false} />}
              className="rounded-full bg-cta px-5 text-cta-foreground hover:bg-cta/90"
            >
              Se connecter
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
