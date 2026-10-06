"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { cn } from "#/lib/utils";


const PHOTOS = [1, 2, 3, 4, 5, 6].map((n) => `/hero/worker-${n}.jpg`);

const INTERVAL_MS = 4500;


export function HeroCarousel({
  className,
  style,
}: Readonly<{ className?: string; style?: React.CSSProperties }>) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        setIndex((i) => (i + 1) % PHOTOS.length);
      }
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div aria-hidden className={cn("pointer-events-none", className)} style={style}>
      {PHOTOS.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="230px"
          priority={i === 0}
          className={cn(
            "object-cover transition-opacity duration-1000 ease-in-out",
            i === index ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
    </div>
  );
}
