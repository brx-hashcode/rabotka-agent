"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { IconMapPin, IconSearch } from "@tabler/icons-react";

import { Button } from "#/components/ui/button";
import { useSession } from "#/app/providers/session-context";
import { useAgentMe } from "#/hooks/use-agent-me";
import { useFeedFilters } from "#/hooks/use-jobs-feed";
import { LocationPicker, type Place } from "./location-picker";

/** A 14-point starburst, as the photo frame in the mockup. */
const STARBURST = (() => {
  const spikes = 14;
  const points: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? 50 : 41;
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    points.push(`${(50 + r * Math.cos(a)).toFixed(2)}% ${(50 + r * Math.sin(a)).toFixed(2)}%`);
  }
  return `polygon(${points.join(", ")})`;
})();

/**
 * The black hero under the header on "/": title, photo, and the search pill.
 * The pill edits a draft and applies it on "Rechercher", like the mockup's
 * button implies — typing does not refetch the feed on every key.
 */
export function FeedHero() {
  const { isAuthenticated } = useSession();
  const [filters, setFilters] = useFeedFilters();
  const [q, setQ] = useState(filters.q);
  const [place, setPlace] = useState<Place>({
    country: filters.country,
    city: filters.city,
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    void setFilters({
      q: q.trim() || null,
      ...(isAuthenticated
        ? {}
        : { country: place.country || null, city: place.city || null }),
    });
  }

  return (
    <section className="relative overflow-hidden bg-header text-header-foreground">
      <div className="relative mx-auto w-full max-w-6xl px-4 pt-8 pb-10 sm:px-6 md:pt-12 md:pb-14">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-6 hidden h-[230px] w-[230px] md:block lg:right-28"
          style={{ clipPath: STARBURST }}
        >
          <Image
            src="/hero-workers.jpg"
            alt=""
            fill
            sizes="230px"
            className="object-cover grayscale"
            priority
          />
        </div>

        <div className="relative max-w-xl space-y-3">
          <h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
            {isAuthenticated ? "Les offres de votre zone" : "Trouvez les offres de votre zone"}
          </h1>
          <p className="text-header-muted text-sm sm:text-base">
            {isAuthenticated
              ? "Repérez une offre, mobilisez les bons travailleurs, suivez vos placements."
              : "Les agents Rabotka connectent les travailleurs de leur ville aux offres qui les attendent."}
          </p>
        </div>

        <form
          onSubmit={submit}
          className="relative mt-8 flex flex-col gap-2 rounded-3xl bg-card p-2 text-foreground md:mt-10 md:flex-row md:items-center md:gap-0 md:rounded-full md:pl-6"
        >
          <label className="flex flex-1 items-center gap-3 px-4 md:px-0">
            <IconSearch className="size-5 shrink-0 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Poste ou référence"
              className="min-w-0 flex-1 bg-transparent py-3 text-[15px] outline-none placeholder:text-muted-foreground"
            />
          </label>

          <span className="mx-4 h-px bg-border md:mx-6 md:h-8 md:w-px" aria-hidden />

          <div className="flex flex-1 items-center px-4 md:px-0">
            {isAuthenticated ? <AgentZones /> : <LocationPicker value={place} onChange={setPlace} />}
          </div>

          <Button
            type="submit"
            size="xl"
            className="rounded-full px-8 md:ml-2"
          >
            Rechercher
          </Button>
        </form>
      </div>
    </section>
  );
}

/** A signed-in agent's feed is limited to their zones; show them instead of a picker. */
function AgentZones() {
  const { data: agent } = useAgentMe();
  const zones = agent?.zones.map((z) => z.city).join(" · ");

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 py-3 text-[15px]">
      <IconMapPin className="size-5 shrink-0 text-muted-foreground" />
      <span className="truncate">
        {zones ? (
          <>
            <span className="text-muted-foreground">Vos zones : </span>
            {zones}
          </>
        ) : (
          <span className="text-muted-foreground">Aucune zone assignée</span>
        )}
      </span>
    </div>
  );
}
