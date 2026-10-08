import { useQuery } from "@tanstack/react-query";

import { useSession } from "#/app/providers/session-context";
import { getMe } from "#/lib/api/agent-controller";

export const agentMeKey = ["agent", "me"] as const;

/** The signed-in agent. Idle (no request) for anonymous visitors. */
export function useAgentMe() {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: agentMeKey,
    queryFn: getMe,
    enabled: isAuthenticated,
  });
}
