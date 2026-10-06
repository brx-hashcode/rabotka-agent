import Image from "next/image";

import { cn } from "#/lib/utils";

/**
 * The logo lockup exactly as rabotka-client's header draws it
 * (src/features/landing/components/header.tsx): public/rabotka-logo.png at
 * full resolution, 40px, "Rabotka" in Gilroy bold, the slogan under it.
 * `unoptimized` serves the original PNG — Next's resize to a small WebP was
 * what made it look pixelated. No mix-blend-multiply (the client's, on white):
 * on the lime band it tinted the logo's white figures green.
 */
export function BrandLogo({
  tone = "light",
  className,
}: Readonly<{ tone?: "light" | "dark"; className?: string }>) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <Image
        src="/rabotka-logo.png"
        alt="Logo Rabotka"
        width={40}
        height={40}
        unoptimized
        priority
        className="size-10 object-contain"
      />
      <span className="flex flex-col leading-none">
        <span className="font-bold font-display text-xl">Rabotka</span>
        <span
          className={cn(
            "text-[10px] leading-none",
            tone === "dark" ? "text-header-muted" : "text-muted-foreground",
          )}
        >
          Job Matching
        </span>
      </span>
    </span>
  );
}
