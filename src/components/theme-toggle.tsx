"use client";

import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";

import { cn } from "#/lib/utils";

const LABEL = "Changer de thème (clair ou sombre)";

/**
 * One round button: the theme that is not shown. Both icons are drawn and CSS
 * picks one, so the server's page is right whatever the device's theme.
 * As rabotka-business's ThemeButton.
 */
export function ThemeButton({
  tone = "header",
  className,
}: Readonly<{ tone?: "header" | "card"; className?: string }>) {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      aria-label={LABEL}
      title={LABEL}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        // On the lime band, like the notification bell beside it.
        tone === "header" && "bg-black/5 text-header-foreground hover:bg-black/10",
        tone === "card" && "bg-page text-foreground hover:bg-page/70",
        className,
      )}
    >
      <IconMoon className="size-5 dark:hidden" />
      <IconSun className="hidden size-5 dark:block" />
    </button>
  );
}
