import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";

import { BrandLogo } from "#/components/brand-logo";
import { SignInFlow } from "#/features/auth/components/sign-in-flow";

const POINTS = [
  "Les offres ouvertes de vos zones, en un coup d'œil",
  "Les travailleurs suggérés pour chaque offre",
  "Vos placements et votre portefeuille au même endroit",
];

/**
 * The sign-in page itself: what a direct visit, a refresh or a shared link
 * shows. Links from inside the app are intercepted into the dialog instead
 * (src/app/@modal/(.)auth/sign-in).
 *
 * Full screen, no site header (it lives in the (site) group). Five columns on
 * large screens: the photo panel takes three, the form two. Below `lg` only
 * the form remains, with the logo above it.
 */
export default function SignInPage() {
  return (
    <div className="grid min-h-svh bg-card lg:grid-cols-5">
      <aside className="relative col-span-3 m-4 hidden overflow-hidden rounded-3xl bg-header text-header-foreground lg:flex">
        <Image
          src="/hero-workers.jpg"
          alt=""
          fill
          sizes="60vw"
          priority
          className="object-cover opacity-55 grayscale"
        />
        <div className="absolute inset-0 bg-linear-to-t from-header via-header/70 to-header/10" />

        <Link href="/" aria-label="Rabotka — accueil" className="absolute top-8 left-10 z-10">
          <BrandLogo tone="dark" />
        </Link>

        <div className="relative mt-auto flex max-w-xl flex-col gap-6 p-12">
          <h1 className="font-semibold text-4xl leading-tight tracking-tight">
            L&apos;espace des agents Rabotka
          </h1>
          <p className="text-header-muted">
            Vous connectez les travailleurs de votre ville aux offres qui les
            attendent. Tout ce qu&apos;il vous faut pour le faire est ici.
          </p>
          <ul className="flex flex-col gap-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3 text-sm">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink/10 text-ink">
                  <IconCheck className="size-3.5" strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className="col-span-2 flex flex-col px-6 py-10 sm:px-12">
        {/* No header on this page: below lg the photo panel (and its logo) is hidden. */}
        <Link href="/" aria-label="Rabotka — accueil" className="self-start lg:hidden">
          <BrandLogo />
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col pt-10 pb-10 lg:justify-center lg:py-10">
          <Suspense>
            <SignInFlow
              layout="split"
              belowForm={
                <Link
                  href="/"
                  className="-mt-4 inline-flex items-center justify-center gap-1.5 rounded-full py-2 text-muted-foreground text-sm transition-colors hover:bg-page hover:text-foreground"
                >
                  <IconArrowLeft className="size-4" />
                  Voir les offres ouvertes
                </Link>
              }
            />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
