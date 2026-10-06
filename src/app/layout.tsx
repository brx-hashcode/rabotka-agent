import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";

import { Providers } from "#/app/providers";
import { SplashScreen } from "#/components/splash-screen";
import { REFRESH_COOKIE } from "#/lib/auth/cookies";
import "./globals.css";

const TITLE = "Rabotka – Espace agent";
const DESCRIPTION =
  "Les agents Rabotka connectent les travailleurs de leur ville aux offres qui les attendent.";

/**
 * Social previews need absolute image URLs. The base is the host the request
 * came in on (behind the tunnel: x-forwarded-*), so no site URL has to be
 * configured per environment.
 */
export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3400";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  return {
    metadataBase: new URL(`${proto}://${host}`),
    title: TITLE,
    description: DESCRIPTION,
    applicationName: "Rabotka Agent",
    manifest: "/manifest.json",
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      siteName: "Rabotka",
      locale: "fr_FR",
      title: "Trouvez les offres de votre zone",
      description: DESCRIPTION,
    },
    twitter: {
      card: "summary_large_image",
      title: "Trouvez les offres de votre zone",
      description: DESCRIPTION,
    },
    // Keep Chrome from machine-translating the page: its <font> wrappers break
    // React's DOM reconciliation (see rabotka-admin index.html).
    other: { google: "notranslate" },
  };
}

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
    // The document background is the header's lime: Safari (iOS 26+) tints
    // its status bar with it, ignoring theme-color, and the top overscroll
    // shows it too. The grey page colour lives on the wrapper below.
    <html lang="fr" translate="no" className="bg-header" suppressHydrationWarning>
      {/* Extensions such as Grammarly add attributes to <body> before React
          hydrates; only this element's own attributes are exempt. */}
      <body className="min-h-svh bg-header antialiased" suppressHydrationWarning>
        <SplashScreen />
        <div className="min-h-svh bg-page">
          <Providers isAuthenticated={isAuthenticated}>
            {children}
            {modal}
          </Providers>
        </div>
      </body>
    </html>
  );
}
