"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FileText, Gauge, LayoutDashboard, LogIn, Search, Settings, ShieldAlert, WalletCards } from "lucide-react";

import { Wordmark } from "@/components/layout/site-header";
import { AuthStatusLabel } from "@/components/providers/AuthProvider";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export const primaryNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Explore", href: "/explore", icon: Search },
  { label: "Hype Check", href: "/hype-check", icon: ShieldAlert },
  { label: "Simulator", href: "/simulator", icon: Gauge },
  { label: "Portfolio", href: "/portfolio", icon: WalletCards },
  { label: "Learn", href: "/learn", icon: BookOpen },
];

export const secondaryNav = [
  { label: "Reports", href: "/analyze", icon: FileText },
  { label: "Profile", href: "/profile", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
}

export function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, demoMode } = useAuth();
  const renderLinks = (items: typeof primaryNav) => items.map(({ label, href, icon: Icon }) => {
    const active = isActive(pathname, href);
    return (
      <Link key={href} href={href} onClick={onNavigate} className={cn("relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-surface-muted hover:text-foreground")}>
        {active && <span className="absolute inset-y-2 left-0 w-0.5 bg-primary" aria-hidden="true" />}
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </Link>
    );
  });

  return (
    <nav aria-label="Product navigation">
      <div className="space-y-1">{renderLinks(primaryNav)}</div>
      <div className="my-4 border-t border-sidebar-border" />
      <div className="space-y-1">{renderLinks(secondaryNav)}</div>
      {(!user || demoMode) && <Link href="/login" onClick={onNavigate} className="mt-3 flex h-9 items-center gap-3 rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"><LogIn className="size-3.5" aria-hidden="true" />Log in to sync progress</Link>}
    </nav>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5"><Link href="/dashboard"><Wordmark /></Link></div>
      <div className="flex-1 overflow-y-auto px-3 py-5"><NavigationLinks /></div>
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0"><p className="truncate text-sm font-medium">{user?.name ?? "Aarav"}</p><p className="mt-0.5 text-xs text-muted-foreground">Learning account</p></div>
          <AuthStatusLabel />
        </div>
      </div>
    </aside>
  );
}
