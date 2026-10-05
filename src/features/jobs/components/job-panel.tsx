"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { IconArrowLeft, IconX } from "@tabler/icons-react";

import { cn } from "#/lib/utils";

/**
 * /jobs/[id] reached from the feed: a panel sliding in from the right with
 * the feed still behind it (intercepted `@modal/(.)jobs/[id]`). Closing is
 * `router.back()`, so the URL returns to the filtered feed. Below `md` it
 * fills the screen with a back arrow, like the sign-in dialog.
 */
export function JobPanel({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();

  return (
    <DialogPrimitive.Root
      open
      onOpenChange={(open) => {
        if (!open) router.back();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/40 max-md:hidden" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-card outline-none",
            "md:max-w-xl md:rounded-l-3xl md:shadow-soft",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-right-8 data-[state=open]:fade-in-0 data-[state=open]:duration-300",
          )}
        >
          <DialogPrimitive.Title className="sr-only">Détail de l&apos;offre</DialogPrimitive.Title>

          <div className="flex items-center justify-between px-4 pt-3 md:px-6 md:pt-5">
            <DialogPrimitive.Close
              className="-ml-2 inline-flex size-10 items-center justify-center rounded-full hover:bg-muted md:hidden"
              aria-label="Retour"
            >
              <IconArrowLeft className="size-5" />
            </DialogPrimitive.Close>
            <span className="hidden md:block" />
            <DialogPrimitive.Close
              className="hidden size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
              aria-label="Fermer"
            >
              <IconX className="size-5" />
            </DialogPrimitive.Close>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-4 pt-2 md:px-8">
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
