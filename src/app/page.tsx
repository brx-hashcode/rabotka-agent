import Image from "next/image";

import { appConfig } from "#/config";

export default function HomePage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-lg bg-card p-8 text-center shadow-soft">
        <Image
          src="/rabotka-logo.png"
          alt="Rabotka"
          width={56}
          height={56}
          className="rounded-xl"
          priority
        />
        <div className="space-y-1">
          <h1 className="font-semibold text-lg">{appConfig.appName}</h1>
          <p className="text-muted-foreground text-sm">
            L&apos;espace agent arrive bientôt.
          </p>
        </div>
      </div>
    </main>
  );
}
