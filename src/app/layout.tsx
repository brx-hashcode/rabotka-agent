import type { Metadata, Viewport } from "next";

import { Providers } from "#/app/providers";
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
  themeColor: "#0F172A",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" translate="no" suppressHydrationWarning>
      <body className="min-h-svh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
