import { JobDetail } from "#/features/jobs/components/job-detail";
import { JobPanel } from "#/features/jobs/components/job-panel";

/** /jobs/[id] reached from the feed: a side panel over it. */
export default async function JobModal({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return (
    <JobPanel>
      <JobDetail id={id} />
    </JobPanel>
  );
}
