import { Suspense } from "react";

import { FeedHero } from "#/features/jobs/components/feed-hero";
import { JobsFeed } from "#/features/jobs/components/jobs-feed";

/** Open jobs for everyone; the signed-in agent's zone jobs once logged in. */
export default function HomePage() {
  return (
    // Desktop: exactly the screen under the 4rem header; the feed's columns
    // scroll inside it instead of the page.
    <div className="lg:flex lg:h-[calc(100svh-4rem)] lg:flex-col lg:overflow-hidden">
      <Suspense>
        <FeedHero />
        <JobsFeed />
      </Suspense>
    </div>
  );
}
