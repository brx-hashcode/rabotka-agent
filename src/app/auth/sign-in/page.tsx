import { Suspense } from "react";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

import { SignInFlow } from "#/features/auth/components/sign-in-flow";

/**
 * The sign-in page itself: what a direct visit, a refresh or a shared link
 * shows. Links from inside the app are intercepted into the dialog instead
 * (src/app/@modal/(.)auth/sign-in).
 */
export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-soft sm:p-8">
        <Suspense>
          <SignInFlow />
        </Suspense>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground"
      >
        <IconArrowLeft className="size-4" />
        Voir les offres ouvertes
      </Link>
    </div>
  );
}
