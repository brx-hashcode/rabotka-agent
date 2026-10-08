import { Suspense } from "react";

import { FeedHero } from "#/features/jobs/components/feed-hero";
import { JobsFeed } from "#/features/jobs/components/jobs-feed";

/** Open jobs for everyone; the signed-in agent's zone jobs once logged in. */
export default function HomePage() {
  return (
    <Suspense>
      <FeedHero />
      <JobsFeed />
    </Suspense>
  );
}
