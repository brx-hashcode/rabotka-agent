import { JobWorkspace } from "#/features/jobs/components/job-workspace";

/**
 * The job page itself: what a shared link, a refresh or "Voir les travailleurs
 * suggérés" opens. For agents it is the workspace (job + suggested workers);
 * opened from the feed, the job alone appears in a side panel instead
 * (src/app/@modal/(.)jobs/[id]).
 */
export default async function JobPage({ params }: PageProps<"/jobs/[id]">) {
  const { id } = await params;
  return <JobWorkspace id={id} />;
}
