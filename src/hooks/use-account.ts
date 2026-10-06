import { useEffect, useRef } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  cancelWithdrawal,
  getStats,
  getWallet,
  listAllPlacements,
  listWithdrawals,
  requestWithdrawal,
} from "#/lib/api/agent-controller";
import type { PlacementGroup, WithdrawalRequest } from "#/lib/api/types";
import { formatXAF } from "#/lib/utils";

const PAGE_SIZE = 20;

/** Everything on the account page; money changes refetch all of it. */
export const accountKey = ["account"] as const;

const nextPage = (last: { page: number; limit: number; total: number }) =>
  last.page * last.limit < last.total ? last.page + 1 : undefined;

export function useAgentStats(days: 30 | 90) {
  return useQuery({
    queryKey: [...accountKey, "stats", days],
    queryFn: () => getStats(days),
    placeholderData: (previous) => previous,
  });
}

/** How many of the latest movements the wallet shows. */
const LATEST_MOVEMENTS = 10;

/** How often the wallet checks back while a withdrawal waits for an admin. */
const PENDING_POLL_MS = 15_000;

/**
 * Balance, rules, the open withdrawal, and the latest movements. Always
 * refetched on focus; polled while a withdrawal is pending, so an admin's
 * payment or refusal shows without a reload. (No agent websocket: the session
 * is an httpOnly cookie the browser cannot hand to a socket.)
 */
export function useWallet() {
  const query = useQuery({
    queryKey: [...accountKey, "wallet"],
    queryFn: () => getWallet(1, LATEST_MOVEMENTS),
    staleTime: 0,
    refetchInterval: (q) => (q.state.data?.openWithdrawal ? PENDING_POLL_MS : false),
  });
  return {
    ...query,
    wallet: query.data,
    movements: query.data?.movements.data ?? [],
  };
}

/**
 * Tells the agent when the withdrawal they were waiting on is decided: the
 * open request disappears from the wallet, so the rest of the account is
 * refreshed and its outcome looked up. Their own cancellation already says
 * so itself.
 */
export function useWithdrawalOutcome(openId: string | null | undefined) {
  const queryClient = useQueryClient();
  const previous = useRef(openId);

  useEffect(() => {
    const was = previous.current;
    previous.current = openId;
    if (!was || openId === was || openId === undefined) return;

    void queryClient.invalidateQueries({ queryKey: accountKey });
    void listWithdrawals(1, 10).then(({ data }) => {
      const decided = data.find((w) => w.id === was);
      if (decided?.status === "PAID") {
        toast.success(
          `Votre retrait de ${formatXAF(decided.amount)} a été versé` +
            (decided.providerReference ? ` (réf. ${decided.providerReference}).` : "."),
        );
      } else if (decided?.status === "REJECTED") {
        toast.error(
          `Votre retrait de ${formatXAF(decided.amount)} a été refusé` +
            (decided.rejectionReason ? ` : ${decided.rejectionReason}` : ".") +
            " Le montant est de nouveau disponible.",
        );
      }
    });
  }, [openId, queryClient]);
}

export function useAccountPlacements(group: PlacementGroup | null) {
  const query = useInfiniteQuery({
    queryKey: [...accountKey, "placements", group],
    queryFn: ({ pageParam }) =>
      listAllPlacements({ group: group ?? undefined, page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
    placeholderData: (previous) => previous,
  });
  return {
    ...query,
    placements: query.data?.pages.flatMap((p) => p.data) ?? [],
    total: query.data?.pages[0]?.total ?? 0,
  };
}

export function useWithdrawals() {
  const query = useInfiniteQuery({
    queryKey: [...accountKey, "withdrawals"],
    staleTime: 0,
    queryFn: ({ pageParam }) => listWithdrawals(pageParam, 10),
    initialPageParam: 1,
    getNextPageParam: nextPage,
  });
  return {
    ...query,
    withdrawals: query.data?.pages.flatMap((p) => p.data) ?? [],
  };
}

export function useRequestWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: WithdrawalRequest) => requestWithdrawal(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKey }),
  });
}

export function useCancelWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelWithdrawal(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: accountKey }),
  });
}
