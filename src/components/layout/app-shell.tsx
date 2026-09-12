"use client";

import { usePathname } from "next/navigation";

import { MobileTopbar } from "@/components/layout/mobile-topbar";
import { Sidebar } from "@/components/layout/sidebar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

const publicRoutes = new Set(["/", "/login", "/signup", "/onboarding"]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (publicRoutes.has(pathname)) return <><SiteHeader />{children}<SiteFooter /></>;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileTopbar />
      <div className="min-h-screen lg:pl-60">{children}</div>
    </div>
  );
}
