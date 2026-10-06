import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";

import { Providers } from "#/app/providers";
import { REFRESH_COOKIE } from "#/lib/auth/cookies";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rabotka – Espace agent",
  description: "Espace des agents de terrain Rabotka.",
  applicationName: "Rabotka Agent",
  manifest: "/manifest.json",
  robots: { index: false, follow: false },
  // Keep Chrome from machine-translating the page: its <font> wrappers break
  // React's DOM reconciliation (see rabotka-admin index.html).
  other: { google: "notranslate" },
};

export const viewport: Viewport = {
  themeColor: "#CBFFA5",
};

/**
 * `modal` is the parallel-route slot that renders /auth/sign-in as a dialog
 * when it is reached by a link from inside the app (src/app/@modal).
 */
export default async function RootLayout({ children, modal }: LayoutProps<"/">) {
  const isAuthenticated = (await cookies()).has(REFRESH_COOKIE);

  return (
    <html lang="fr" translate="no" suppressHydrationWarning>
      {/* Extensions such as Grammarly add attributes to <body> before React
          hydrates; only this element's own attributes are exempt. */}
      <body className="min-h-svh bg-page antialiased" suppressHydrationWarning>
        <Providers isAuthenticated={isAuthenticated}>
          {children}
          {modal}
        </Providers>
      </body>
    </html>
  );
}
