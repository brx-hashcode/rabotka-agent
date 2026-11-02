"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "#/components/ui/button";
import { useAccountPlacements } from "#/hooks/use-account";
import { friendlyError } from "#/lib/api/friendly-error";
import type { PlacementGroup } from "#/lib/api/types";
import { cn } from "#/lib/utils";
import { PlacementItem } from "./placement-item";
import { PeopleRowsSkeleton } from "#/components/page-skeletons";

const FILTERS: { label: string; value: PlacementGroup | null }[] = [
  { label: "Tous", value: null },
  { label: "En cours", value: "active" },
  { label: "Terminés", value: "ended" },
  { label: "Refusés ou annulés", value: "closed" },
];

/** Every worker the agent placed, on any job, with what each one earns. */
export function PlacementsTab() {
  const [group, setGroup] = useState<PlacementGroup | null>(null);
  const list = useAccountPlacements(group);

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setGroup(f.value)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 font-medium text-sm transition-colors",
              group === f.value
                ? "bg-chip-green text-chip-green-foreground"
                : "bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
            {group === f.value && !list.isPending && (
              <span className="ml-1.5 tabular-nums opacity-70">{list.total}</span>
            )}
          </button>
        ))}
      </div>

      {list.isPending ? (
        <PeopleRowsSkeleton rows={4} />
      ) : list.isError ? (
        <p className="rounded-2xl bg-card p-6 text-center text-muted-foreground text-sm">
          {friendlyError(list.error, "Impossible de charger vos placements.")}
        </p>
      ) : list.placements.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-card px-5 py-10 text-center">
          <p className="text-muted-foreground text-sm">
            {group ? "Aucun placement dans cette catégorie." : "Vous n'avez encore placé personne."}
          </p>
          {!group && (
            <Button className="rounded-full" render={<Link href="/" />}>
              Voir les offres de vos zones
            </Button>
          )}
        </div>
      ) : (
        <>
          <div
            className={cn(
              "flex flex-col divide-y divide-border/60 rounded-2xl bg-card transition-opacity",
              list.isPlaceholderData && "opacity-60",
            )}
          >
            {list.placements.map((p) => (
              <PlacementItem key={p.applicationId} placement={p} />
            ))}
          </div>
          {list.hasNextPage && (
            <Button
              variant="secondary"
              className="self-center rounded-full bg-card"
              onClick={() => void list.fetchNextPage()}
              disabled={list.isFetchingNextPage}
            >
              {list.isFetchingNextPage ? "Chargement…" : "Voir plus"}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
