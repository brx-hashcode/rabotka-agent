import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "#/lib/api/agent-controller";
import type {
  AgentNotification,
  AgentNotificationsPage,
  AgentNotificationType,
} from "#/lib/api/types";
import { refreshSession } from "#/lib/auth/session-client";
import { createSseParser } from "#/lib/sse";
import { accountKey } from "./use-account";
import { agentMeKey } from "./use-agent-me";

export const notificationsKey = ["notifications"] as const;

type Pages = InfiniteData<AgentNotificationsPage, number>;

const PAGE_SIZE = 20;

export function useNotifications(enabled: boolean) {
  const query = useInfiniteQuery({
    queryKey: notificationsKey,
    queryFn: ({ pageParam }) => listNotifications(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page * last.limit < last.total ? last.page + 1 : undefined,
    enabled,
    // The stream keeps it current; a refetch on focus covers a dropped one.
    staleTime: 30_000,
  });
  return {
    ...query,
    notifications: query.data?.pages.flatMap((p) => p.data) ?? [],
    unread: query.data?.pages[0]?.unread ?? 0,
  };
}

/** Applies `change` to every cached notification, and sets the unread count. */
function updateCache(
  queryClient: QueryClient,
  change: (n: AgentNotification) => AgentNotification,
  unread: (current: number) => number,
) {
  queryClient.setQueryData<Pages>(notificationsKey, (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page, i) => ({
            ...page,
            data: page.data.map(change),
            unread: i === 0 ? Math.max(0, unread(page.unread)) : page.unread,
          })),
        }
      : data,
  );
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onMutate: (id) => {
      const now = new Date().toISOString();
      updateCache(
        queryClient,
        (n) => (n.id === id && !n.readAt ? { ...n, readAt: now } : n),
        (c) => c - 1,
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationsKey }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onMutate: () => {
      const now = new Date().toISOString();
      updateCache(queryClient, (n) => (n.readAt ? n : { ...n, readAt: now }), () => 0);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationsKey }),
  });
}

/** What else on screen a notification makes stale. */
const STALE: Partial<Record<AgentNotificationType, readonly (readonly string[])[]>> = {
  COMMISSION_EARNED: [accountKey],
  COMMISSION_AVAILABLE: [accountKey],
  COMMISSION_CANCELLED: [accountKey],
  WITHDRAWAL_PAID: [accountKey],
  WITHDRAWAL_REJECTED: [accountKey],
  PLACEMENT_ACCEPTED: [accountKey],
  PLACEMENT_STARTED: [accountKey],
  PLACEMENT_COMPLETED: [accountKey],
  PLACEMENT_ENDED: [accountKey],
  NEW_JOBS_IN_ZONE: [["jobs"]],
  ZONES_CHANGED: [agentMeKey, ["jobs"]],
  ACCOUNT_SUSPENDED: [agentMeKey],
  ACCOUNT_REACTIVATED: [agentMeKey, ["jobs"]],
};

const STREAM_URL = "/api/v1/agent/notifications/stream";
const RETRY_MIN_MS = 1_000;
const RETRY_MAX_MS = 30_000;

/**
 * Keeps one live connection to the backend's notification stream while the
 * agent is signed in. Goes through the same-origin proxy like every API call,
 * so the session cookie authenticates it; a 401 refreshes the session once
 * and reconnects. The backend closes the stream every 10 minutes (before the
 * access token it was opened with would expire) and this reconnects at once.
 *
 * Each notification lands in the bell's cache, refreshes what it concerns
 * (wallet, placements, feed, profile) and shows a toast.
 */
export function useNotificationStream(enabled: boolean) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    if (!enabled) return;
    const abort = new AbortController();
    let retryMs = RETRY_MIN_MS;
    let connectedBefore = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let wakeRetry: (() => void) | null = null;

    const receive = (n: AgentNotification) => {
      queryClient.setQueryData<Pages>(notificationsKey, (data) => {
        if (!data) return data;
        if (data.pages.some((p) => p.data.some((x) => x.id === n.id))) return data;
        const [first, ...rest] = data.pages;
        return {
          ...data,
          pages: [
            { ...first, data: [n, ...first.data], total: first.total + 1, unread: first.unread + 1 },
            ...rest,
          ],
        };
      });
      if (!queryClient.getQueryData(notificationsKey)) {
        void queryClient.invalidateQueries({ queryKey: notificationsKey });
      }
      for (const key of STALE[n.type] ?? []) {
        void queryClient.invalidateQueries({ queryKey: key });
      }
      toast(n.title, {
        description: n.body,
        classNames: { description: "!text-muted-foreground" },
        action: n.link
          ? { label: "Voir", onClick: () => routerRef.current.push(n.link as string) }
          : undefined,
      });
    };

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        wakeRetry = resolve;
        timer = setTimeout(resolve, ms);
      });

    const connect = async (): Promise<void> => {
      while (!abort.signal.aborted) {
        try {
          const res = await fetch(STREAM_URL, {
            credentials: "same-origin",
            headers: { accept: "text/event-stream" },
            cache: "no-store",
            signal: abort.signal,
          });
          if (res.status === 401) {
            // A refused refresh means the session is over: the next ordinary
            // request takes the agent to sign-in, so stop here.
            if (!(await refreshSession())) return;
            continue;
          }
          if (!res.ok || !res.body) throw new Error(`stream ${res.status}`);

          if (connectedBefore) {
            // Anything sent while we were reconnecting.
            void queryClient.invalidateQueries({ queryKey: notificationsKey });
          }
          connectedBefore = true;
          retryMs = RETRY_MIN_MS;

          const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
          const parse = createSseParser();
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            for (const event of parse(value)) {
              if (event.event !== "notification") continue;
              try {
                receive(JSON.parse(event.data) as AgentNotification);
              } catch {
                // A malformed event is not worth dropping the stream for.
              }
            }
          }
          // The server's 10-minute close: reconnect straight away.
          continue;
        } catch {
          if (abort.signal.aborted) return;
        }
        await wait(retryMs);
        retryMs = Math.min(retryMs * 2, RETRY_MAX_MS);
      }
    };

    // Back online, or back to the tab: do not sit out the backoff.
    const retryNow = () => {
      if (timer) clearTimeout(timer);
      retryMs = RETRY_MIN_MS;
      wakeRetry?.();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") retryNow();
    };
    globalThis.addEventListener("online", retryNow);
    document.addEventListener("visibilitychange", onVisible);

    void connect();
    return () => {
      abort.abort();
      if (timer) clearTimeout(timer);
      globalThis.removeEventListener("online", retryNow);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled, queryClient]);
}
