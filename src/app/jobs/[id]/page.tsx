import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { JobDetail } from "#/features/jobs/components/job-detail";
import { REFRESH_COOKIE } from "#/lib/auth/cookies";

/** Full job details are for signed-in agents; anyone else signs in first. */
export default async function JobPage({ params }: PageProps<"/jobs/[id]">) {
  const { id } = await params;
  if (!(await cookies()).has(REFRESH_COOKIE)) {
    redirect(`/auth/sign-in?next=${encodeURIComponent(`/jobs/${id}`)}`);
  }
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <JobDetail id={id} />
    </div>
  );
}
