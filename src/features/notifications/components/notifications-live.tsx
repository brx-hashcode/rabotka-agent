"use client";

import { useEffect } from "react";

import { useSession } from "#/app/providers/session-context";
import { useNotificationStream } from "#/hooks/use-notifications";
import { syncPush } from "#/lib/push";

/**
 * Mounted once in the providers: while the agent is signed in, holds the live
 * notification stream and keeps this device's Web Push subscription current.
 */
export function NotificationsLive() {
  const { isAuthenticated } = useSession();
  useNotificationStream(isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) void syncPush().catch(() => undefined);
  }, [isAuthenticated]);

  return null;
}
