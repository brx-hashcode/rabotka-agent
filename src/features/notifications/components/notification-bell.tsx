"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconBell,
  IconBellRinging,
  IconBriefcase,
  IconCash,
  IconCashOff,
  IconCircleCheck,
  IconCircleX,
  IconMapPin,
  IconPlayerPlay,
  IconShieldOff,
  IconUserCheck,
  IconWallet,
  type Icon,
} from "@tabler/icons-react";

import { Popover, PopoverContent, PopoverTrigger } from "#/components/ui/popover";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "#/hooks/use-notifications";
import { usePush } from "#/hooks/use-push";
import type { AgentNotification, AgentNotificationType } from "#/lib/api/types";
import { postedAgo } from "#/lib/job-labels";
import { cn } from "#/lib/utils";

const LOOK: Record<AgentNotificationType, { icon: Icon; tone: string }> = {
  COMMISSION_EARNED: { icon: IconCash, tone: "bg-chip-green text-chip-green-foreground" },
  COMMISSION_AVAILABLE: { icon: IconWallet, tone: "bg-chip-green text-chip-green-foreground" },
  COMMISSION_CANCELLED: { icon: IconCashOff, tone: "bg-destructive/10 text-destructive" },
  WITHDRAWAL_PAID: { icon: IconCircleCheck, tone: "bg-chip-green text-chip-green-foreground" },
  WITHDRAWAL_REJECTED: { icon: IconCircleX, tone: "bg-destructive/10 text-destructive" },
  PLACEMENT_ACCEPTED: { icon: IconUserCheck, tone: "bg-chip-violet text-chip-violet-foreground" },
  PLACEMENT_STARTED: { icon: IconPlayerPlay, tone: "bg-chip-violet text-chip-violet-foreground" },
  PLACEMENT_COMPLETED: { icon: IconCircleCheck, tone: "bg-chip-violet text-chip-violet-foreground" },
  PLACEMENT_ENDED: { icon: IconCircleX, tone: "bg-chip-amber text-chip-amber-foreground" },
  NEW_JOBS_IN_ZONE: { icon: IconBriefcase, tone: "bg-chip-amber text-chip-amber-foreground" },
  ZONES_CHANGED: { icon: IconMapPin, tone: "bg-chip-green text-chip-green-foreground" },
  ACCOUNT_SUSPENDED: { icon: IconShieldOff, tone: "bg-destructive/10 text-destructive" },
  ACCOUNT_REACTIVATED: { icon: IconCircleCheck, tone: "bg-chip-green text-chip-green-foreground" },
};

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
        className="w-[min(24rem,calc(100vw-1.5rem))] rounded-3xl border-0 bg-card shadow-soft before:hidden"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="font-semibold text-base">Notifications</p>
            {feed.unread > 0 && (
              <button
                type="button"
                onClick={() => markAll.mutate()}
                className="rounded-full px-2 py-1 font-medium text-muted-foreground text-xs hover:bg-page hover:text-foreground"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          <PushPrompt />

          <div className="-mx-1 flex max-h-[min(60svh,28rem)] flex-col gap-1 overflow-y-auto px-1">
            {feed.isPending ? (
              [0, 1, 2].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-page" />
              ))
            ) : feed.notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-page text-muted-foreground">
                  <IconBell className="size-6" />
                </span>
                <p className="font-medium text-sm">Aucune notification</p>
                <p className="text-muted-foreground text-xs">
                  Commissions, retraits, placements et nouvelles offres de vos zones
                  s&apos;afficheront ici.
                </p>
              </div>
            ) : (
              feed.notifications.map((n) => <Item key={n.id} n={n} onOpen={openOne} />)
            )}
            {feed.hasNextPage && (
              <button
                type="button"
                onClick={() => feed.fetchNextPage()}
                disabled={feed.isFetchingNextPage}
                className="mt-1 rounded-full py-2 font-medium text-muted-foreground text-sm hover:bg-page hover:text-foreground"
              >
                {feed.isFetchingNextPage ? "Chargement…" : "Voir plus"}
              </button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Item({
  n,
  onOpen,
}: Readonly<{ n: AgentNotification; onOpen: (n: AgentNotification) => void }>) {
  const { icon: Icon, tone } = LOOK[n.type] ?? LOOK.ZONES_CHANGED;
  return (
    <button
      type="button"
      onClick={() => onOpen(n)}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-page",
        !n.readAt && "bg-page/60",
      )}
    >
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", tone)}>
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1 space-y-0.5">
        <span className="flex items-start justify-between gap-2">
          <span className={cn("text-sm leading-snug", !n.readAt && "font-semibold")}>
            {n.title}
          </span>
          {!n.readAt && (
            <span aria-label="Non lue" className="mt-1.5 size-2 shrink-0 rounded-full bg-whatsapp" />
          )}
        </span>
        <span className="line-clamp-2 block text-muted-foreground text-xs leading-relaxed">
          {n.body}
        </span>
        <span className="block text-[11px] text-muted-foreground/80">{postedAgo(n.createdAt)}</span>
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
