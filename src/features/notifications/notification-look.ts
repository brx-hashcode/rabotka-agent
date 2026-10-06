import {
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

import type { AgentNotificationType } from "#/lib/api/types";

/** Each notification type's icon and tint, in the bell and in the toast. */
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

export function notificationLook(type: AgentNotificationType) {
  return LOOK[type] ?? LOOK.ZONES_CHANGED;
}
