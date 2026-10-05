"use client";

import { useEffect, useMemo, useRef } from "react";
import { IconFilter, IconMoodEmpty, IconRefresh } from "@tabler/icons-react";

import { Button } from "#/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#/components/ui/sheet";
import { useSession } from "#/app/providers/session-context";
import { useJobCategories } from "#/hooks/use-job-categories";
import { useFeedFilters, useJobsFeed } from "#/hooks/use-jobs-feed";
import { friendlyError } from "#/lib/api/friendly-error";
import { FiltersSidebar, useActiveFilterCount } from "./filters-sidebar";
import { JobCard, JobCardSkeleton } from "./job-card";
import { SortSelect } from "./sort-select";

/** The "/" feed below the hero: title row, filter sidebar, card grid. */
export function JobsFeed() {
  const { isAuthenticated } = useSession();
  const [filters] = useFeedFilters();
  const feed = useJobsFeed();
  const categories = useJobCategories();
  const activeFilters = useActiveFilterCount();

  const iconBySlug = useMemo(
    () => new Map(categories.data?.map((c) => [c.slug, c.icon]) ?? []),
    [categories.data],
  );
  const hasFilters = Boolean(
    filters.q || filters.country || filters.city || activeFilters > 0,
  );

  // Load the next page as the end of the grid scrolls into view.
  const sentinel = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = feed;
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sidebar = <FiltersSidebar facets={feed.facets} showPay={isAuthenticated} />;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h2 className="font-semibold text-2xl tracking-tight">
            {isAuthenticated ? "Offres de vos zones" : "Offres ouvertes"}
          </h2>
          {feed.isSuccess && (
            <span className="text-muted-foreground text-sm tabular-nums">
              {feed.total} {feed.total > 1 ? "offres" : "offre"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="h-10 rounded-full bg-card px-4 lg:hidden">
                <IconFilter />
                Filtres{activeFilters > 0 && ` (${activeFilters})`}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtres</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-6">{sidebar}</div>
            </SheetContent>
          </Sheet>
          <SortSelect />
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-6">{sidebar}</div>
        </aside>

        <div className="min-w-0 flex-1">
          {feed.isPending && (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }, (_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          )}

          {feed.isError && (
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-card p-10 text-center">
              <p className="text-muted-foreground text-sm">
                {friendlyError(feed.error, "Impossible de charger les offres.")}
              </p>
              <Button variant="outline" onClick={() => void feed.refetch()}>
                <IconRefresh />
                Réessayer
              </Button>
            </div>
          )}

          {feed.isSuccess && feed.jobs.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-10 text-center">
              <IconMoodEmpty className="size-8 text-muted-foreground" />
              <p className="font-medium">{emptyTitle(isAuthenticated, hasFilters)}</p>
              <p className="max-w-sm text-muted-foreground text-sm">
                {emptyText(isAuthenticated, hasFilters)}
              </p>
            </div>
          )}

          {feed.jobs.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {feed.jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  icon={job.category ? iconBySlug.get(job.category.slug) : undefined}
                />
              ))}
              {feed.isFetchingNextPage &&
                Array.from({ length: 2 }, (_, i) => <JobCardSkeleton key={`more-${i}`} />)}
            </div>
          )}

          <div ref={sentinel} />
        </div>
      </div>
    </div>
  );
}

function emptyTitle(isAuthenticated: boolean, hasFilters: boolean) {
  if (hasFilters) return "Aucune offre ne correspond";
  return isAuthenticated ? "Aucune offre dans vos zones" : "Aucune offre ouverte";
}

function emptyText(isAuthenticated: boolean, hasFilters: boolean) {
  if (hasFilters) return "Essayez une autre recherche, un autre lieu ou moins de filtres.";
  return isAuthenticated
    ? "Revenez bientôt. Si vous n'avez aucune zone assignée, contactez votre responsable."
    : "Revenez bientôt : de nouvelles offres sont publiées chaque jour.";
}
