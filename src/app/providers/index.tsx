"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { TooltipProvider } from "#/components/ui/tooltip";
import { Toaster } from "#/components/ui/sonner";
import { NotificationsLive } from "#/features/notifications/components/notifications-live";
import { setSessionExpiredHandler } from "#/lib/auth/session-client";
import { httpStatusOf } from "#/lib/api/friendly-error";
import { SessionProvider } from "./session-context";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        // A 401 has already been through one refresh-and-retry (withSession);
        // retrying it again only delays the redirect to sign-in. A 404 will
        // not change either.
        retry: (failureCount, error) =>
          httpStatusOf(error) !== 401 && httpStatusOf(error) !== 404 && failureCount < 3,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * One client per server render (never shared between visitors), one for the
 * lifetime of the tab in the browser.
 */
export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

type ProvidersProps = Readonly<{
  children: ReactNode;
  isAuthenticated: boolean;
}>;

export function Providers({ children, isAuthenticated }: ProvidersProps) {
  const queryClient = getQueryClient();
  const router = useRouter();

  // The session could not be refreshed (cookies already cleared by
  // /session/refresh): drop cached agent data and open sign-in. `next`
  // brings the agent back to the current page.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      queryClient.clear();
      const here = `${globalThis.location.pathname}${globalThis.location.search}`;
      router.replace(`/auth/sign-in?next=${encodeURIComponent(here)}`);
      router.refresh();
    });
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider isAuthenticated={isAuthenticated}>
        {/*
          The device's theme until one is chosen (the sun/moon in the header
          and on sign-in), as rabotka-business. The lime header and hero stay
          lime in both; the page and its cards go dark.
        */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="theme"
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <TooltipProvider>
              {children}
              <NotificationsLive />
              <Toaster position="top-center" />
            </TooltipProvider>
          </NuqsAdapter>
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
