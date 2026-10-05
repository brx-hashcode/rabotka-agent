import { useQuery } from "@tanstack/react-query";

import { useSession } from "#/app/providers/session-context";
import { getAgentJob } from "#/lib/api/agent-controller";
import { httpStatusOf } from "#/lib/api/friendly-error";
import { getPublicJob } from "#/lib/api/public-controller";
import type { AgentJob, PublicJobDetail } from "#/lib/api/types";

export type JobDetailResult =
  | { kind: "agent"; job: AgentJob }
  /** Anonymous visitor, or an agent looking at a job outside their zones. */
  | { kind: "public"; job: PublicJobDetail; outsideZones: boolean };

/**
 * One job. Signed-in agents get the full job (`agent/jobs/:id`); a job outside
 * their zones answers 404 there, so it falls back to the public summary like
 * an anonymous visitor gets (`public/jobs/:id`).
 */
export function useJobDetail(id: string) {
  const { isAuthenticated } = useSession();

  return useQuery<JobDetailResult>({
    queryKey: ["jobs", isAuthenticated ? "agent" : "public", "detail", id],
    queryFn: async () => {
      if (isAuthenticated) {
        try {
          return { kind: "agent", job: await getAgentJob(id) };
        } catch (error) {
          if (httpStatusOf(error) !== 404) throw error;
          return { kind: "public", job: await getPublicJob(id), outsideZones: true };
        }
      }
      return { kind: "public", job: await getPublicJob(id), outsideZones: false };
    },
  });
}
