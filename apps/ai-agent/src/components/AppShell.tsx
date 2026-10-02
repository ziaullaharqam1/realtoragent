import { SiteNav } from "@/components/SiteNav";

export function AppShell({
  children,
  bare = false,
}: {
  children: React.ReactNode;
  bare?: boolean;
}) {
  return (
    <>
      <SiteNav />
      {bare ? children : <div className="pp-shell">{children}</div>}
    </>
  );
}
