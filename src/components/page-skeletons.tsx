import { cn } from "#/lib/utils";

/**
 * The app's loading states: the shape of what is about to appear, in grey,
 * pulsing quietly — never a spinner over a blank page. Route `loading.tsx`
 * files and the components' own loading branches share these pieces, so
 * nothing jumps from one to the other.
 */

/**
 * One grey shape: a tint of the text colour, so it reads the same on a
 * card, on the page and in dark mode. `onPage` marks the ones drawn on the
 * page's grey (a touch stronger there).
 */
export function Bone({ className, onPage }: Readonly<{ className?: string; onPage?: boolean }>) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-lg", onPage ? "bg-foreground/[0.08]" : "bg-foreground/[0.06]", className)}
    />
  );
}

function Status({ className, children }: Readonly<{ className?: string; children: React.ReactNode }>) {
  return (
    <div role="status" aria-label="Chargement" className={className}>
      {children}
    </div>
  );
}

// ── Offers ──────────────────────────────────────────────────────────────

/** One offer card of the feed: icon, title and category, chips, then the footer line. */
export function JobCardSkeleton() {
  return (
    <div className="flex h-52 min-w-0 flex-col gap-4 rounded-2xl bg-card p-4 sm:p-6">
      <div className="flex gap-3">
        <Bone className="size-11 rounded-xl" />
        <div className="flex-1 space-y-2 pt-1">
          <Bone className="h-4 w-2/3" />
          <Bone className="h-3 w-1/3" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <Bone className="h-5 w-16 rounded-md" />
        <Bone className="h-5 w-24 rounded-md" />
        <Bone className="h-5 w-20 rounded-md" />
      </div>
      <Bone className="mt-auto h-5 w-full" />
    </div>
  );
}

/** The filters column: a few groups of options. */
function FiltersSkeleton() {
  return (
    <div className="space-y-6">
      {[4, 5, 3].map((n, g) => (
        <div key={g} className="space-y-3">
          <Bone onPage className="h-4 w-24" />
          {Array.from({ length: n }, (_, i) => (
            <Bone key={i} onPage className="h-5 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** The home page while it loads: the green hero and its search, then title, filters and cards. */
export function JobsFeedSkeleton() {
  return (
    <Status>
      <section className="bg-header">
        <div className="mx-auto w-full max-w-6xl space-y-3 px-4 pt-8 pb-10 sm:px-6 md:pt-12 md:pb-14">
          <Bone className="h-9 w-3/4 max-w-lg bg-header-foreground/10" />
          <Bone className="h-4 w-2/3 max-w-md bg-header-foreground/10" />
          <div className="!mt-8 rounded-3xl bg-card p-2 md:!mt-10 md:rounded-full">
            <Bone className="h-12 w-full rounded-full" />
          </div>
        </div>
      </section>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Bone onPage className="h-8 w-56" />
          <Bone onPage className="h-10 w-36 rounded-full" />
        </div>
        <div className="flex gap-8">
          <aside className="hidden w-60 shrink-0 lg:block">
            <FiltersSkeleton />
          </aside>
          <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </Status>
  );
}

/**
 * An offer's summary while it loads, as JobSummary lays it out: icon and
 * title, chips, the pay or notice block, the details rows, the description.
 */
export function JobSummarySkeleton({ header = true }: Readonly<{ header?: boolean }>) {
  return (
    <div className="flex flex-col gap-6">
      {header && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <Bone className="size-14 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-2 pt-1">
              <Bone className="h-6 w-4/5" />
              <Bone className="h-6 w-1/2" />
              <Bone className="h-4 w-1/3" />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Bone className="h-6 w-16 rounded-full" />
            <Bone className="h-6 w-14 rounded-md" />
            <Bone className="h-6 w-20 rounded-md" />
            <Bone className="h-6 w-24 rounded-md" />
          </div>
        </div>
      )}
      <Bone className="h-20 rounded-2xl" />
      <div className="space-y-2">
        <Bone className="h-4 w-16" />
        <div className="divide-y divide-card overflow-hidden rounded-2xl bg-page">
          {["w-24", "w-40", "w-24", "w-28", "w-20"].map((w, i) => (
            <div key={i} className="flex items-center justify-between gap-4 px-4 py-3.5">
              <Bone onPage className="h-4 w-20" />
              <Bone onPage className={cn("h-4", w)} />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Bone className="h-4 w-24" />
        <div className="space-y-2.5 rounded-2xl bg-page p-4">
          {["w-full", "w-11/12", "w-full", "w-2/3"].map((w, i) => (
            <Bone key={i} onPage className={cn("h-3.5", w)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Rows of people: the placements of an offer, or its candidates. */
export function PeopleRowsSkeleton({ rows = 2 }: Readonly<{ rows?: number }>) {
  return (
    <div className="flex flex-col divide-y divide-border/60 rounded-2xl bg-card">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 sm:p-5">
          <Bone className="size-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Bone className="h-4 w-40 max-w-full" />
            <Bone className="h-3 w-28" />
          </div>
          <Bone className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** « Mes placements » while it loads: its title and a couple of rows. */
export function PlacementsSkeleton() {
  return (
    <Status className="flex flex-col gap-3">
      <Bone onPage className="h-6 w-40" />
      <PeopleRowsSkeleton rows={2} />
    </Status>
  );
}

/**
 * An offer page while it loads. Its final layout (offer beside placements,
 * or beside candidates) is only known once the offer is read, so the frame
 * is the wide two-column one both use: no narrow page jumping to a wide one.
 */
export function JobWorkspaceSkeleton() {
  return (
    <Status className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <Bone onPage className="h-5 w-36" />
        <Bone onPage className="size-10 rounded-full" />
      </div>
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:items-start lg:gap-8">
        <div className="rounded-3xl bg-card p-5 sm:p-8">
          <JobSummarySkeleton />
        </div>
        <div className="flex flex-col gap-3">
          <Bone onPage className="h-6 w-40" />
          <PeopleRowsSkeleton rows={3} />
        </div>
      </div>
    </Status>
  );
}

// ── Account ─────────────────────────────────────────────────────────────

/** The four figures of the overview, as StatCard draws them. */
export function StatTilesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-2xl bg-card p-4 sm:p-5">
          <Bone className="size-9 rounded-xl" />
          <div className="space-y-2">
            <Bone className="h-3 w-24" />
            <Bone className="h-7 w-16" />
            <Bone className="h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** The account page while it loads: the agent, the tabs, the overview. */
export function AccountSkeleton() {
  return (
    <Status className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-center gap-4">
        <Bone onPage className="size-16 shrink-0 rounded-full sm:size-20" />
        <div className="space-y-2">
          <Bone onPage className="h-8 w-48" />
          <div className="flex gap-1.5">
            <Bone onPage className="h-5 w-24" />
            <Bone onPage className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="flex gap-1">
        {["w-20", "w-24", "w-24", "w-16"].map((w, i) => (
          <Bone key={i} onPage className={cn("h-9 rounded-full", w)} />
        ))}
      </div>
      <StatTilesSkeleton />
      <div className="space-y-4 rounded-3xl bg-card p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Bone className="h-5 w-20" />
            <Bone className="h-3 w-32" />
          </div>
          <Bone className="h-8 w-24 rounded-full" />
        </div>
        <Bone className="h-40 rounded-xl" />
      </div>
    </Status>
  );
}
