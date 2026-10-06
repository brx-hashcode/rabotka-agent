import { SiteHeader } from "#/features/layout/components/site-header";

/**
 * Pages under the black header: the feed and job pages. The sign-in page sits
 * outside this group so it can fill the screen without it — while the sign-in
 * dialog, opened over the feed, keeps the feed's header behind it.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
    </>
  );
}
