"use client";

import { useEffect, useState, type FormEvent } from "react";

import { IconMapPin, IconSearch, IconX } from "@tabler/icons-react";

import { Button } from "#/components/ui/button";
import { useAgentMe } from "#/hooks/use-agent-me";
import { useHydrated } from "#/hooks/use-hydrated";
import { useFeedFilters, useFeedMode } from "#/hooks/use-jobs-feed";
import { HeroCarousel } from "./hero-carousel";
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

/** How long typing must pause before the feed searches. */
const SEARCH_DEBOUNCE_MS = 400;

/**
 * The hero under the header on "/": title, photo, and the search pill.
 * Searches as you type — once typing pauses, so the feed does not refetch on
 * every key — and a picked place applies at once. "Rechercher" (or Enter)
 * still applies straight away for anyone who reaches for it.
 */
export function FeedHero() {
  const { isAuthenticated, zoneFeed } = useFeedMode();
  const [filters, setFilters] = useFeedFilters();
  const [q, setQ] = useState(filters.q);
  const [place, setPlace] = useState<Place>({
    country: filters.country,
    city: filters.city,
  });

  const appliedQ = filters.q;
  useEffect(() => {
    const next = q.trim();
    if (next === appliedQ) return;
    const timer = setTimeout(() => void setFilters({ q: next || null }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [q, appliedQ, setFilters]);

  function pickPlace(next: Place) {
    setPlace(next);
    void setFilters({ country: next.country || null, city: next.city || null });
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    void setFilters({
      q: q.trim() || null,
      ...(zoneFeed
        ? {}
        : { country: place.country || null, city: place.city || null }),
    });
  }

  return (
    <section className="relative shrink-0 overflow-hidden bg-header text-header-foreground">
      <div className="relative mx-auto w-full max-w-6xl px-4 pt-8 pb-10 sm:px-6 md:pt-12 md:pb-14">
        <HeroCarousel
          className="absolute top-0 right-6 hidden h-[230px] w-[230px] md:block lg:right-28"
          style={{ clipPath: STARBURST }}
        />

        <div className="relative max-w-xl space-y-3">
          <h1 className="font-semibold text-[28px] leading-tight tracking-tight sm:text-4xl">
            {heroTitle(isAuthenticated, zoneFeed)}
          </h1>
          <p className="text-header-muted text-sm sm:text-base">
            {isAuthenticated
              ? "Repérez une offre, mobilisez les bons travailleurs, suivez vos placements."
              : "Vous connectez les travailleurs de votre ville aux offres qui les attendent."}
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
              className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none md:text-[15px] placeholder:text-muted-foreground"
            />
          </label>

          <span className="mx-4 h-px bg-border md:mx-6 md:h-8 md:w-px" aria-hidden />

          <div className="flex flex-1 items-center px-4 md:px-0">
            {zoneFeed ? (
              <AgentZones
                onClear={() => void setFilters({ scope: "all", min: null, max: null })}
              />
            ) : (
              <>
                <LocationPicker value={place} onChange={pickPlace} />
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => {
                      setPlace({ country: "", city: "" });
                      void setFilters({ scope: null, country: null, city: null });
                    }}
                    className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-full bg-chip-green px-3 py-1.5 font-medium text-chip-green-foreground text-xs transition-colors hover:brightness-95"
                  >
                    <IconMapPin className="size-3.5" />
                    Mes zones
                  </button>
                )}
              </>
            )}
          </div>

          <Button
            type="submit"
            size="xl"
            variant="ghost"
            // The ink pill of « Se connecter » and the sign-in page.
            className="rounded-full bg-ink px-8 text-white hover:bg-ink/90 hover:text-white md:ml-2"
          >
            Rechercher
          </Button>
        </form>
      </div>
    </section>
  );
}

/**
 * A signed-in agent's feed defaults to their zones (set by an admin), shown
 * here instead of a picker. The ✕ switches to every open job, like a visitor.
 */
function AgentZones({ onClear }: Readonly<{ onClear: () => void }>) {
  const { data: agent } = useAgentMe();
  // The server never has the agent; the browser may already have it cached.
  // Until hydration is over, render what the server did.
  const hydrated = useHydrated();
  const known = hydrated ? agent : undefined;
  const zones = known?.zones.map((z) => z.city).join(" · ");

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 py-3 text-[15px]">
      <IconMapPin className="size-5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate">
        <span className="text-muted-foreground">
          {known && !zones ? "Aucune zone assignée" : "Vos zones : "}
        </span>
        {zones}
      </span>
      <button
        type="button"
        onClick={onClear}
        className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Voir toutes les offres, hors de vos zones"
        title="Voir toutes les offres"
      >
        <IconX className="size-4" />
      </button>
    </div>
  );
}

function heroTitle(isAuthenticated: boolean, zoneFeed: boolean): string {
  if (zoneFeed) return "Les offres de votre zone";
  return isAuthenticated ? "Toutes les offres ouvertes" : "Trouvez les offres de votre zone";
}
