"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { IconBell, IconBellRinging, IconChecks } from "@tabler/icons-react";

import { Popover, PopoverContent, PopoverTrigger } from "#/components/ui/popover";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "#/hooks/use-notifications";
import { usePush } from "#/hooks/use-push";
import type { AgentNotification } from "#/lib/api/types";
import { notificationLook } from "../notification-look";
import { postedAgo } from "#/lib/job-labels";
import { cn } from "#/lib/utils";
import { Bone } from "#/components/page-skeletons";

/** The header's bell: unread count, the latest notifications, and push for this device. */
export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const feed = useNotifications(true);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const openOne = (n: AgentNotification) => {
    if (!n.readAt) markRead.mutate(n.id);
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  const badge = feed.unread > 9 ? "9+" : String(feed.unread);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={
          feed.unread > 0 ? `Notifications, ${feed.unread} non lues` : "Notifications"
        }
        className="relative flex size-10 items-center justify-center rounded-full bg-black/5 outline-none transition-colors hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-ink/50"
      >
        <IconBell className="size-5" />
        {feed.unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 font-semibold text-[11px] text-white tabular-nums ring-2 ring-header">
            {badge}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[min(28rem,calc(100vw-1.5rem))] overflow-hidden rounded-3xl border-0 bg-card shadow-[0_16px_48px_-16px_rgb(0_0_0/0.28)] before:hidden [&>[data-slot=popover-viewport]]:p-0"
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-lg">Notifications</p>
              {feed.unread > 0 && (
                <span className="rounded-full bg-chip-green px-2 py-0.5 font-semibold text-chip-green-foreground text-xs tabular-nums">
                  {feed.unread > 99 ? "99+" : feed.unread}
                </span>
              )}
            </div>
            {feed.unread > 0 && (
              <button
                type="button"
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
                className="-mr-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-muted-foreground text-xs transition-colors hover:bg-page hover:text-foreground disabled:opacity-60"
              >
                <IconChecks className="size-4" />
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="px-4 pb-2 empty:hidden">
            <PushPrompt />
          </div>

          <div className="max-h-[min(65svh,32rem)] overflow-y-auto overscroll-contain pb-2">
            {feed.isPending ? (
              <div role="status" aria-label="Chargement" className="px-2 pt-1">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 px-3 py-3">
                    <Bone className="size-10 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2 pt-0.5">
                      <div className="flex justify-between gap-4">
                        <Bone className="h-4 w-1/2" />
                        <Bone className="h-3 w-8" />
                      </div>
                      <Bone className="h-3 w-full" />
                      <Bone className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : feed.notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-8 pt-6 pb-8 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-page text-muted-foreground">
                  <IconBell className="size-6" />
                </span>
                <p className="font-medium text-sm">Aucune notification</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Commissions, retraits, placements et nouvelles offres de vos zones
                  s&apos;afficheront ici.
                </p>
              </div>
            ) : (
              groupByDay(feed.notifications).map(([label, items]) => (
                <section key={label}>
                  <h3 className="sticky top-0 z-10 bg-card px-5 pt-3 pb-1.5 font-medium text-muted-foreground text-xs">
                    {label}
                  </h3>
                  <div className="px-2">
                    {items.map((n) => (
                      <Item key={n.id} n={n} onOpen={openOne} />
                    ))}
                  </div>
                </section>
              ))
            )}
            {feed.hasNextPage && (
              <div className="px-4 pt-2">
                <button
                  type="button"
                  onClick={() => feed.fetchNextPage()}
                  disabled={feed.isFetchingNextPage}
                  className="w-full rounded-full bg-page py-2.5 font-medium text-sm transition-colors hover:bg-page/70 disabled:opacity-60"
                >
                  {feed.isFetchingNextPage ? "Chargement…" : "Voir plus"}
                </button>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Newest first, under « Aujourd'hui », « Hier », « Cette semaine » and « Plus ancien ». */
function groupByDay(list: AgentNotification[]): [string, AgentNotification[]][] {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const day = 86_400_000;
  const label = (n: AgentNotification) => {
    const t = new Date(n.createdAt).getTime();
    if (t >= startOfToday.getTime()) return "Aujourd'hui";
    if (t >= startOfToday.getTime() - day) return "Hier";
    if (t >= startOfToday.getTime() - 6 * day) return "Cette semaine";
    return "Plus ancien";
  };
  const groups = new Map<string, AgentNotification[]>();
  for (const n of list) {
    const key = label(n);
    groups.set(key, [...(groups.get(key) ?? []), n]);
  }
  return [...groups];
}

/** « 5 min », « 7 h », « 2 j », then the date: short enough to sit beside the title. */
function shortAgo(createdAt: string): string {
  const date = new Date(createdAt);
  const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} j`;
  return format(date, "d MMM", { locale: fr });
}

function Item({
  n,
  onOpen,
}: Readonly<{ n: AgentNotification; onOpen: (n: AgentNotification) => void }>) {
  const { icon: Icon, tone } = notificationLook(n.type);
  const unread = !n.readAt;
  return (
    <button
      type="button"
      onClick={() => onOpen(n)}
      className="flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-page focus-visible:bg-page focus-visible:outline-none"
    >
      <span className="relative shrink-0">
        <span className={cn("flex size-10 items-center justify-center rounded-full", tone)}>
          <Icon className="size-[18px]" />
        </span>
        {unread && (
          <span
            aria-label="Non lue"
            className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-whatsapp ring-2 ring-card"
          />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span
            className={cn(
              "min-w-0 text-sm leading-snug",
              unread ? "font-semibold text-foreground" : "font-medium text-foreground/80",
            )}
          >
            {n.title}
          </span>
          <span
            className={cn(
              "shrink-0 text-[11px] tabular-nums",
              unread ? "font-medium text-whatsapp-dark" : "text-muted-foreground",
            )}
            title={postedAgo(n.createdAt)}
          >
            {shortAgo(n.createdAt)}
          </span>
        </span>
        <span className="mt-0.5 line-clamp-2 block text-muted-foreground text-[13px] leading-snug">
          {n.body}
        </span>
      </span>
    </button>
  );
}

/** Offers Web Push on this device when it is possible and not yet on. */
function PushPrompt() {
  const push = usePush();
  if (push.state === "off") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-chip-green/60 p-3">
        <IconBellRinging className="size-5 shrink-0 text-chip-green-foreground" />
        <p className="min-w-0 flex-1 text-xs leading-snug">
          Soyez prévenu(e) même quand l&apos;application est fermée.
        </p>
        <button
          type="button"
          onClick={() => void push.enable()}
          disabled={push.pending}
          className="shrink-0 rounded-full bg-ink px-3 py-1.5 font-medium text-white text-xs disabled:opacity-60"
        >
          Activer
        </button>
      </div>
    );
  }
  if (push.state === "needs-install") {
    return (
      <p className="rounded-2xl bg-page p-3 text-muted-foreground text-xs leading-snug">
        Sur iPhone, ajoutez Rabotka à l&apos;écran d&apos;accueil (Partager → « Sur l&apos;écran
        d&apos;accueil ») et ouvrez-le depuis là pour recevoir les notifications.
      </p>
    );
  }
  return null;
}
