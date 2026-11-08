import { Suspense } from "react";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

import { AuthShell } from "#/features/auth/components/auth-shell";
import { SignInFlow } from "#/features/auth/components/sign-in-flow";

/**
 * The sign-in page: the only way in, from a link or an expired session alike.
 *
 * Full screen, no site header: the form column on the left, the wall of what
 * the space does on the right (AuthShell), as in rabotka-business. Below
 * `lg` only the form remains. No sign-up tab: agents are created by an admin.
 */
export default function SignInPage() {
  return (
    <AuthShell>
      <div className="flex flex-1 flex-col justify-center py-12">
        <Suspense>
          <SignInFlow
            layout="split"
            belowForm={
              <Link
                href="/"
                className="-mt-4 inline-flex items-center justify-center gap-1.5 rounded-full py-2 text-muted-foreground text-sm transition-colors hover:bg-page hover:text-foreground"
              >
                <IconArrowLeft className="size-4" />
                Voir les offres ouvertes
              </Link>
            }
          />
        </Suspense>
      </div>
    </AuthShell>
  );
}
