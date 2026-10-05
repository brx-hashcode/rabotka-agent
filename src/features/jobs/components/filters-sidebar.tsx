"use client";

import { useState } from "react";

import { Checkbox } from "#/components/ui/checkbox";
import { Slider } from "#/components/ui/slider";
import { useJobCategories } from "#/hooks/use-job-categories";
import { EMPLOYMENT_TYPES, useFeedFilters } from "#/hooks/use-jobs-feed";
import type { JobFacets } from "#/lib/api/types";
import { EMPLOYMENT_TYPE_LABELS } from "#/lib/job-labels";
import { formatXAF } from "#/lib/utils";

const CATEGORIES_SHOWN = 8;

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
  const [showAll, setShowAll] = useState(false);
  const hasAny = f.types.length > 0 || f.categories.length > 0 || f.min !== null || f.max !== null;

  function toggle<T extends string>(list: T[], value: T): T[] | null {
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    return next.length > 0 ? next : null;
  }

  const sortedCategories = [...(categories.data ?? [])].sort(
    (a, b) => (facets?.category[b.slug] ?? 0) - (facets?.category[a.slug] ?? 0),
  );
  const visible = showAll ? sortedCategories : sortedCategories.slice(0, CATEGORIES_SHOWN);

  return (
    <div className="flex flex-col gap-8">
      <FilterGroup
        title="Type de contrat"
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
        {EMPLOYMENT_TYPES.map((type) => (
          <CheckRow
            key={type}
            label={EMPLOYMENT_TYPE_LABELS[type]}
            count={facets?.employmentType[type]}
            checked={f.types.includes(type)}
            onChange={() => void setFilters({ types: toggle(f.types, type) })}
          />
        ))}
      </FilterGroup>

      {showPay && facets?.amount && facets.amount.max > facets.amount.min && (
        <PayRange bounds={facets.amount} />
      )}

      <FilterGroup title="Catégories">
        {categories.isPending &&
          Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-5 animate-pulse rounded bg-muted" />
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
            count={facets?.category[c.slug]}
            checked={f.categories.includes(c.slug)}
            onChange={() => void setFilters({ categories: toggle(f.categories, c.slug) })}
          />
        ))}
        {sortedCategories.length > CATEGORIES_SHOWN && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="self-start font-medium text-sm text-whatsapp-dark hover:underline"
          >
            {showAll ? "Voir moins" : `Voir tout (${sortedCategories.length})`}
          </button>
        )}
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
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count !== undefined && <span className="text-muted-foreground text-xs tabular-nums">{count}</span>}
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
