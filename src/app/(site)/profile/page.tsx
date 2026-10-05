import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AgentProfile } from "#/features/profile/components/agent-profile";
import { REFRESH_COOKIE } from "#/lib/auth/cookies";

/** The signed-in agent's own account. */
export default async function ProfilePage() {
  if (!(await cookies()).has(REFRESH_COOKIE)) redirect("/auth/sign-in?next=%2Fprofile");
  return <AgentProfile />;
}
