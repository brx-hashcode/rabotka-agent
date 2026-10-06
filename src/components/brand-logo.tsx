import Image from "next/image";

import { cn } from "#/lib/utils";

/**
 * Logo, "Rabotka" and the slogan under it — the lockup rabotka-client uses
 * (src/features/landing/components/header.tsx). `tone="dark"` is for the
 * black header band and the sign-in photo panel.
 */
export function BrandLogo({
  tone = "light",
  className,
}: Readonly<{ tone?: "light" | "dark"; className?: string }>) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image src="/rabotka-logo.png" alt="" width={32} height={32} className="rounded-lg" priority />
      <span className="flex flex-col leading-none">
        <span className="font-bold text-[17px]">Rabotka</span>
        <span
          className={cn(
            "mt-1 text-[10px] leading-none",
            tone === "dark" ? "text-header-muted" : "text-muted-foreground",
          )}
        >
          Job Matching
        </span>
      </span>
    </span>
  );
}
