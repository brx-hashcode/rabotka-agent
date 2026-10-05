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
      <div className="flex flex-col rounded-3xl bg-card px-4 pt-4 sm:px-8 sm:pt-6">
        <JobDetail id={id} />
      </div>
    </div>
  );
}
