import { JobsFeedSkeleton } from "#/components/page-skeletons";

/** The home page while it loads: its shape, not a spinner. */
export default function Loading() {
  return <JobsFeedSkeleton />;
}
