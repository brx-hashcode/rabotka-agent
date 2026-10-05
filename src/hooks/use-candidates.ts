import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  claimLead,
  getCandidates,
  logCall,
  revealPhone,
} from "#/lib/api/agent-controller";
import type { AgentCandidate, AgentLead, CallOutcome } from "#/lib/api/types";

export const candidatesKey = (jobId: string) => ["candidates", jobId] as const;

/** Suggested workers for a job in the agent's zones. */
export function useCandidates(jobId: string, enabled: boolean) {
  return useQuery({
    queryKey: candidatesKey(jobId),
    queryFn: () => getCandidates(jobId),
    enabled,
    staleTime: 30_000,
  });
}

/** Writes a lead returned by a mutation back into the candidates list. */
function useLeadWriter(jobId: string) {
  const queryClient = useQueryClient();
  return (lead: AgentLead) =>
    queryClient.setQueryData<AgentCandidate[]>(candidatesKey(jobId), (list) =>
      list?.map((c) => (c.lead?.id === lead.id ? { ...c, lead } : c)),
    );
}

export function useClaimLead(jobId: string) {
  const write = useLeadWriter(jobId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: claimLead,
    onSuccess: write,
    // Lost the race (409): refresh to show who holds the worker now.
    onError: () => queryClient.invalidateQueries({ queryKey: candidatesKey(jobId) }),
  });
}

/**
 * Revealed numbers are cached per lead for the session: showing them again
 * must not log (or count) another reveal.
 */
export function useRevealPhone() {
  return useMutation({ mutationFn: revealPhone });
}

export function useLogCall(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      leadId,
      outcome,
      note,
    }: {
      leadId: string;
      outcome: CallOutcome;
      note?: string;
    }) => logCall(leadId, outcome, note),
    // A closing outcome removes the worker from the suggestions; refetch.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: candidatesKey(jobId) }),
  });
}
