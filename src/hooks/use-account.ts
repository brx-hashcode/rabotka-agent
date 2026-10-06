import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelWithdrawal,
  getStats,
  getWallet,
  listAllPlacements,
  listWithdrawals,
  requestWithdrawal,
} from "#/lib/api/agent-controller";
import type { PlacementGroup, WithdrawalRequest } from "#/lib/api/types";

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

/**
 * Balance and rules come with every page of movements; the first page's are
 * the ones shown.
 */
export function useWallet() {
  const query = useInfiniteQuery({
    queryKey: [...accountKey, "wallet"],
    queryFn: ({ pageParam }) => getWallet(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (last) => nextPage(last.movements),
  });
  const first = query.data?.pages[0];
  return {
    ...query,
    wallet: first,
    movements: query.data?.pages.flatMap((p) => p.movements.data) ?? [],
  };
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
