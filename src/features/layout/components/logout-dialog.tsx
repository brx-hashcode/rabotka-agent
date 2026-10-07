"use client";

import { useState } from "react";
import { IconLogout } from "@tabler/icons-react";

import { ActionDialog } from "#/features/jobs/components/action-dialog";
import { useLogoutMutation } from "#/hooks/use-auth-mutations";
import { disablePush } from "#/lib/push";

/** Asks before signing the agent out; the mutation then leaves for the home page. */
export function LogoutDialog({
  open,
  onOpenChange,
}: Readonly<{ open: boolean; onOpenChange: (open: boolean) => void }>) {
  const logout = useLogoutMutation();
  const [leaving, setLeaving] = useState(false);

  // This device stops receiving the agent's push first: a shared phone must
  // not keep showing their notifications to whoever signs in next.
  const confirm = () => {
    setLeaving(true);
    void disablePush()
      .catch(() => undefined)
      .finally(() =>
        logout.mutate(undefined, {
          onSettled: () => {
            setLeaving(false);
            onOpenChange(false);
          },
        }),
      );
  };

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      tone="warning"
      icon={<IconLogout className="size-5" />}
      title="Se déconnecter ?"
      description="Vous devrez saisir à nouveau votre email et un code pour revenir."
      confirmLabel="Se déconnecter"
      pending={leaving || logout.isPending}
      onConfirm={confirm}
    />
  );
}
