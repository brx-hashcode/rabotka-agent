"use client";

import { useState } from "react";
import { IconSearch, IconX } from "@tabler/icons-react";

import { Checkbox } from "#/components/ui/checkbox";
import { Slider } from "#/components/ui/slider";
import { useJobCategories } from "#/hooks/use-job-categories";
import { useFeedFilters } from "#/hooks/use-jobs-feed";
import type { JobFacets } from "#/lib/api/types";
import { cn, formatXAF } from "#/lib/utils";
import { Bone } from "#/components/page-skeletons";

/** Number of active sidebar filters (for the mobile "Filtres (n)" button). */
export function useActiveFilterCount() {
  const [f] = useFeedFilters();
  return f.types.length + f.categories.length + (f.min !== null || f.max !== null ? 1 : 0);
}

/**
 * Job type, pay (signed-in agents only — the public feed never deals in pay)
 * and categories. Counts come from the feed's facets; each counts what ticking
 * that box would show, so they stay meaningful while other boxes are ticked.
 */
export function FiltersSidebar({
  facets,
  showPay,
}: Readonly<{ facets: JobFacets | undefined; showPay: boolean }>) {
  const [f, setFilters] = useFeedFilters();
  const categories = useJobCategories();
  const hasAny = f.types.length > 0 || f.categories.length > 0 || f.min !== null || f.max !== null;

  function toggle<T extends string>(list: T[], value: T): T[] | null {
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    return next.length > 0 ? next : null;
  }

  const sortedCategories = [...(categories.data ?? [])].sort(
    (a, b) => (facets?.category[b.slug] ?? 0) - (facets?.category[a.slug] ?? 0),
  );

  return (
    <div className="flex flex-col gap-8">
      {/* No contract filter: agents only work missions. */}
      {showPay && facets?.amount && facets.amount.max > facets.amount.min && (
        <PayRange bounds={facets.amount} />
      )}

      <FilterGroup
        title="Catégories"
        action={
          hasAny && (
            <button
              type="button"
              onClick={() =>
                void setFilters({ types: null, categories: null, min: null, max: null })
              }
              className="font-medium text-destructive text-xs hover:underline"
            >
              Tout effacer
            </button>
          )
        }
      >
        <CategoryPicker
          categories={sortedCategories}
          pending={categories.isPending}
          counts={facets?.category}
          selected={f.categories}
          onToggle={(slug) => void setFilters({ categories: toggle(f.categories, slug) })}
        />
      </FilterGroup>
    </div>
  );
}

function FilterGroup({
  title,
  action,
  children,
}: Readonly<{ title: string; action?: React.ReactNode; children: React.ReactNode }>) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-sm">{title}</h3>
        {action}
      </div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </section>
  );
}

function CheckRow({
  label,
  count,
  checked,
  onChange,
}: Readonly<{
  label: React.ReactNode;
  count: number | undefined;
  checked: boolean;
  onChange: () => void;
}>) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2.5 text-sm",
        // Nothing to find there right now: still tickable, visibly quieter.
        count === 0 && !checked && "text-muted-foreground",
      )}
    >
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count !== undefined && (
        <span className="text-muted-foreground text-xs tabular-nums">{count}</span>
      )}
    </label>
  );
}

/** Two-thumb pay range; applied when the thumb is released. */
function PayRange({ bounds }: Readonly<{ bounds: { min: number; max: number } }>) {
  const [f, setFilters] = useFeedFilters();
  const committed: [number, number] = [f.min ?? bounds.min, f.max ?? bounds.max];
  // Only set while a thumb is being dragged; otherwise the URL is the value.
  const [draft, setDraft] = useState<[number, number] | null>(null);
  const shown = draft ?? committed;

  const step = Math.max(Math.round((bounds.max - bounds.min) / 100), 1);

  return (
    <FilterGroup title="Rémunération">
      <Slider
        min={bounds.min}
        max={bounds.max}
        step={step}
        value={shown}
        onValueChange={(v) => setDraft([v[0] ?? bounds.min, v[1] ?? bounds.max])}
        onValueCommit={([min, max]) => {
          setDraft(null);
          void setFilters({
            min: min !== undefined && min > bounds.min ? min : null,
            max: max !== undefined && max < bounds.max ? max : null,
          });
        }}
        aria-label="Rémunération"
      />
      <div className="flex justify-between text-muted-foreground text-xs tabular-nums">
        <span>{formatXAF(shown[0])}</span>
        <span>{formatXAF(shown[1])}</span>
      </div>
    </FilterGroup>
  );
}

/** Rows shown before "Voir toutes", busiest first. */
const TOP_CATEGORIES = 6;

/** Lowercased, accents removed: "maçon" finds "Maçonnerie". */
const fold = (text: string) =>
  text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

type PickerCategory = { id: string; slug: string; name: string; icon?: string | null };

/**
 * The category filter, as the client app does it: a search field rather than
 * one long list. Ticked categories stay on top as chips; untouched, the list
 * shows the busiest few and opens to all on demand. No inner scroll box — the
 * sheet (phone) or the column (desktop) scrolls as a whole.
 */
function CategoryPicker({
  categories,
  pending,
  counts,
  selected,
  onToggle,
}: Readonly<{
  categories: PickerCategory[];
  pending: boolean;
  counts: Record<string, number> | undefined;
  selected: string[];
  onToggle: (slug: string) => void;
}>) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const q = fold(query.trim());
  // Only categories with offers right now (and any already ticked); until the
  // counts arrive, all of them.
  const offered = counts
    ? categories.filter((c) => (counts[c.slug] ?? 0) > 0 || selected.includes(c.slug))
    : categories;
  const matches = q ? offered.filter((c) => fold(c.name).includes(q)) : offered;
  const visible = q || showAll ? matches : matches.slice(0, TOP_CATEGORIES);
  const chosen = categories.filter((c) => selected.includes(c.slug));

  return (
    <div className="flex flex-col gap-3">
      {chosen.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chosen.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onToggle(c.slug)}
              aria-label={`Retirer ${c.name}`}
              className="inline-flex max-w-full items-center gap-1 rounded-full bg-chip-green py-1 pr-1.5 pl-2.5 font-medium text-chip-green-foreground text-xs"
            >
              <span className="truncate">{c.name}</span>
              <IconX className="size-3.5 shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Grey in the phone sheet (white), white in the desktop sidebar, which
          sits on the grey page — a grey box there had no edge at all. */}
      <label className="flex h-11 items-center gap-2 rounded-2xl bg-page px-3 ring-1 ring-black/5 ring-inset focus-within:ring-2 focus-within:ring-whatsapp/40 lg:bg-card">
        <IconSearch className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une catégorie"
          aria-label="Rechercher une catégorie"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Effacer la recherche"
            className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-card"
          >
            <IconX className="size-3.5" />
          </button>
        )}
      </label>

      <div className="flex flex-col gap-2.5">
        {pending &&
          Array.from({ length: 5 }, (_, i) => (
            <Bone key={i} onPage className="h-5" />
          ))}
        {visible.map((c) => (
          <CheckRow
            key={c.id}
            label={
              <>
                <span aria-hidden className="mr-1.5">
                  {c.icon ?? "💼"}
                </span>
                {c.name}
              </>
            }
            count={counts ? (counts[c.slug] ?? 0) : undefined}
            checked={selected.includes(c.slug)}
            onChange={() => onToggle(c.slug)}
          />
        ))}
        {q && matches.length === 0 && (
          <p className="text-muted-foreground text-sm">Aucune catégorie pour « {query.trim()} ».</p>
        )}
      </div>

      {!q && !pending && matches.length > TOP_CATEGORIES && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="self-start font-medium text-sm text-whatsapp-dark hover:underline"
        >
          {showAll ? "Voir moins" : "Voir toutes les catégories"}
        </button>
      )}
    </div>
  );
}
