"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { useFeedFilters } from "#/hooks/use-jobs-feed";

const LABELS = { recent: "Plus récentes", start: "Début le plus proche" } as const;

export function SortSelect() {
  const [{ sort }, setFilters] = useFeedFilters();

  return (
    <Select
      value={sort}
      onValueChange={(v) => void setFilters({ sort: v === "recent" ? null : (v as "start") })}
    >
      <SelectTrigger
        className="h-10! gap-2 rounded-full border-0 bg-card px-4"
        aria-label="Trier les offres"
      >
        <SelectValue>{LABELS[sort]}</SelectValue>
      </SelectTrigger>
      <SelectContent align="end" position="popper" sideOffset={6} className="min-w-52">
        <SelectItem value="recent">{LABELS.recent}</SelectItem>
        <SelectItem value="start">{LABELS.start}</SelectItem>
      </SelectContent>
    </Select>
  );
}
