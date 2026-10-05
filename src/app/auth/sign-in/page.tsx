import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconArrowLeft, IconCheck, IconSparkles } from "@tabler/icons-react";

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
 * Five columns on large screens: the photo panel takes three (the hero's
 * black band, continued), the form two. Below `lg` only the form remains.
 */
export default function SignInPage() {
  return (
    <div className="grid min-h-[calc(100svh-4rem)] bg-card lg:grid-cols-5">
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

        <div className="relative mt-auto flex max-w-xl flex-col gap-6 p-12">
          <IconSparkles className="size-9 text-whatsapp" />
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
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-whatsapp/15 text-whatsapp">
                  <IconCheck className="size-3.5" strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className="col-span-2 flex flex-col px-6 py-10 sm:px-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-page hover:text-foreground"
        >
          <IconArrowLeft className="size-4" />
          Voir les offres ouvertes
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col pt-8 pb-10 lg:justify-center lg:py-10">
          <Suspense>
            <SignInFlow layout="split" />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
