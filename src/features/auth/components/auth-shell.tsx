import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLogo } from "#/components/brand-logo";
import { cn } from "#/lib/utils";

const PUBLIC_SITE = "https://www.rabotka.work";

/**
 * The frame of the sign-in page, the same as rabotka-business' auth pages:
 * on the left the form column (brand at the top, a small footer at the
 * bottom), on the right a wall of cards saying what the agent space does.
 *
 * The cards state what the space does today — no figures without a source,
 * no commission amounts (they live in SystemConfig and change).
 */
export function AuthShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="grid min-h-svh bg-card lg:grid-cols-2">
      <section className="flex min-h-svh min-w-0 flex-col px-5 py-6 sm:px-10">
        <Link href="/" aria-label="Rabotka — accueil" className="self-start">
          <BrandLogo />
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">{children}</div>

        <footer className="mt-6 flex flex-wrap gap-x-5 gap-y-1 font-mono text-muted-foreground text-xs">
          <span>© Rabotka {new Date().getFullYear()}</span>
          <a href={PUBLIC_SITE} className="no-underline hover:text-foreground">
            www.rabotka.work
          </a>
          <a
            href={`${PUBLIC_SITE}/privacy`}
            target="_blank"
            rel="noreferrer"
            className="no-underline hover:text-foreground"
          >
            Confidentialité
          </a>
        </footer>
      </section>

      <FeatureWall />
    </div>
  );
}

/** A few words underlined in lime, as with a highlighter; lime text on the ink card. */
function Mark({ children, onDark = false }: Readonly<{ children: ReactNode; onDark?: boolean }>) {
  return onDark ? (
    <span className="text-brand-lime">{children}</span>
  ) : (
    <span className="box-decoration-clone bg-[linear-gradient(transparent_58%,var(--brand-lime)_58%)]">
      {children}
    </span>
  );
}

function Statement({
  children,
  label,
  size = "md",
  dark = false,
}: Readonly<{ children: ReactNode; label: string; size?: "md" | "lg"; dark?: boolean }>) {
  return (
    <>
      <span
        aria-hidden
        className={cn(
          "font-bold font-display leading-none",
          size === "lg" ? "text-4xl" : "text-2xl",
          dark ? "text-brand-lime" : "text-foreground/25",
        )}
      >
        “
      </span>
      <p className={cn("mt-3 tracking-tight", size === "lg" ? "text-[1.7rem] leading-snug" : "leading-relaxed")}>
        {children}
      </p>
      <p className={cn("mt-4 text-xs", dark ? "text-white/55" : "text-muted-foreground")}>{label}</p>
    </>
  );
}

/**
 * Two columns of cards in a grey frame: white ones, one lime (the figure),
 * one ink. Hidden below `lg`, where the form takes the whole screen.
 */
function FeatureWall() {
  const card = "flex flex-col justify-center rounded-3xl p-8";
  return (
    <aside aria-label="L'espace agent en bref" className="hidden p-3 lg:sticky lg:top-0 lg:block lg:h-svh">
      <div className="grid h-full grid-cols-2 gap-3 rounded-[28px] bg-page p-3">
        <div className="flex min-h-0 flex-col gap-3">
          <div className={cn(card, "flex-[5] bg-card")}>
            <Statement label="Offres de vos zones" size="lg">
              Les offres ouvertes de vos villes, en un coup d&apos;œil : <Mark>vous savez où l&apos;on recrute</Mark>.
            </Statement>
          </div>
          <div className={cn(card, "flex-[2.5] bg-ink text-white")}>
            <Statement label="Accès agent" dark>
              Votre accès est créé par l&apos;équipe Rabotka : <Mark onDark>connectez-vous avec l&apos;adresse e-mail
              qu&apos;elle a enregistrée</Mark>.
            </Statement>
          </div>
          <div className={cn(card, "flex-[2.5] bg-card")}>
            <Statement label="Travailleurs suggérés">
              Pour chaque offre, <Mark>les profils qui lui correspondent le mieux</Mark>, avec leur fiabilité.
            </Statement>
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-3">
          <div className={cn(card, "flex-[2.5] bg-brand-lime text-ink")}>
            <p className="font-bold font-display text-7xl leading-none">6</p>
            <p className="mt-4 max-w-56 text-sm">
              Un code à 6 chiffres reçu par e-mail à chaque connexion : aucun mot de passe à retenir.
            </p>
          </div>
          <div className={cn(card, "flex-[2.5] bg-card")}>
            <Statement label="Contact direct">
              Appelez ou écrivez sur WhatsApp, puis <Mark>notez l&apos;issue de l&apos;échange</Mark>.
            </Statement>
          </div>
          <div className={cn(card, "flex-[5] bg-card")}>
            <Statement label="Placements et portefeuille" size="lg">
              Vos placements suivis jusqu&apos;au bout, et <Mark>votre solde retiré par Mobile Money</Mark>.
            </Statement>
          </div>
        </div>
      </div>
    </aside>
  );
}
