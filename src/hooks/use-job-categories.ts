import { useQuery } from "@tanstack/react-query";

import { getJobCategories } from "#/lib/api/public-controller";

/** Every job category (name, slug, emoji). Changes rarely. */
export function useJobCategories() {
  return useQuery({
    queryKey: ["job-categories"],
    queryFn: getJobCategories,
    staleTime: 24 * 60 * 60 * 1000,
  });
}
