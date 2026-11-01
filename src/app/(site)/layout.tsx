import { SiteHeader } from "#/features/layout/components/site-header";

/**
 * Pages under the black header: the feed and job pages. The sign-in page sits
 * outside this group so it can fill the screen without it.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
    </>
  );
}
