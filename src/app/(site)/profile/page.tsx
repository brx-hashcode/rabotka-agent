import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AccountPage } from "#/features/profile/components/account-page";
import { REFRESH_COOKIE } from "#/lib/auth/cookies";

/** The signed-in agent's own space: stats, wallet, placements, profile. */
export default async function ProfilePage() {
  if (!(await cookies()).has(REFRESH_COOKIE)) redirect("/auth/sign-in?next=%2Fprofile");
  return <AccountPage />;
}
