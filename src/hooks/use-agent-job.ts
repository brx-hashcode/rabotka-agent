import { useQuery } from "@tanstack/react-query";

import { getAgentJob } from "#/lib/api/agent-controller";

export function useAgentJob(id: string) {
  return useQuery({
    queryKey: ["jobs", "agent", "detail", id],
    queryFn: () => getAgentJob(id),
  });
}
