import { useInfiniteQuery } from "@tanstack/react-query";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";

import { useSession } from "#/app/providers/session-context";
import { listAgentJobs } from "#/lib/api/agent-controller";
import { listPublicJobs } from "#/lib/api/public-controller";
import type {
  AgentJob,
  EmploymentType,
  JobsPage,
  PublicJob,
} from "#/lib/api/types";

const PAGE_SIZE = 20;

export const EMPLOYMENT_TYPES = ["MISSION", "CDD", "CDI", "STAGE"] as const;
const SORTS = ["recent", "start"] as const;

const feedFilterParsers = {
  q: parseAsString.withDefault(""),
  country: parseAsString.withDefault(""),
  city: parseAsString.withDefault(""),
  types: parseAsArrayOf(parseAsStringLiteral(EMPLOYMENT_TYPES)).withDefault([]),
  categories: parseAsArrayOf(parseAsString).withDefault([]),
  min: parseAsInteger,
  max: parseAsInteger,
  sort: parseAsStringLiteral(SORTS).withDefault("recent"),
};

/** Feed filters, kept in the URL so a filtered feed can be shared. */
export function useFeedFilters() {
  return useQueryStates(feedFilterParsers);
}

export type FeedJob = PublicJob | AgentJob;

export function isAgentJob(job: FeedJob): job is AgentJob {
  return "amount" in job;
}

/**
 * The "/" feed. Anonymous visitors get every open job as a public summary
 * (`public/jobs`); a signed-in agent gets the full jobs of their zones
 * (`agent/jobs`) — no location filter (the zones are the filter), but a pay
 * range, which the public feed never offers.
 */
export function useJobsFeed() {
  const { isAuthenticated } = useSession();
  const [f] = useFeedFilters();

  const common = {
    q: f.q.trim() || undefined,
    employmentTypes: f.types.length ? (f.types as EmploymentType[]) : undefined,
    categories: f.categories.length ? f.categories : undefined,
    sort: f.sort,
  };
  const query = isAuthenticated
    ? { ...common, minAmount: f.min ?? undefined, maxAmount: f.max ?? undefined }
    : { ...common, country: f.country || undefined, city: f.city || undefined };

  const feed = useInfiniteQuery<JobsPage<FeedJob>>({
    queryKey: ["jobs", isAuthenticated ? "agent" : "public", query],
    queryFn: ({ pageParam }) => {
      const page = pageParam as number;
      return isAuthenticated
        ? listAgentJobs({ ...query, page, limit: PAGE_SIZE })
        : listPublicJobs({ ...query, page, limit: PAGE_SIZE });
    },
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page * last.limit < last.total ? last.page + 1 : undefined,
    placeholderData: (previous) => previous,
  });

  return {
    ...feed,
    jobs: feed.data?.pages.flatMap((p) => p.data) ?? [],
    total: feed.data?.pages[0]?.total ?? 0,
    facets: feed.data?.pages[0]?.facets,
  };
}
