import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

import { JobDetail } from "#/features/jobs/components/job-detail";

/**
 * The job page itself: what a shared link, a refresh or a direct visit shows.
 * Opened from the feed, the same detail appears in a side panel instead
 * (src/app/@modal/(.)jobs/[id]). Public: pay and contact-adjacent fields are
 * only in the signed-in agent's version.
 */
export default async function JobPage({ params }: PageProps<"/jobs/[id]">) {
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground"
      >
        <IconArrowLeft className="size-4" />
        Toutes les offres
      </Link>
      <div className="rounded-3xl bg-card p-6 shadow-soft sm:p-8">
        <JobDetail id={id} />
      </div>
    </div>
  );
}
