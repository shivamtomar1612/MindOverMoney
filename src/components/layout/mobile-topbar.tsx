"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Wordmark } from "@/components/layout/site-header";
import { NavigationLinks } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";

export function MobileTopbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/96 backdrop-blur-sm lg:hidden">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" onClick={() => setOpen(false)}><Wordmark /></Link>
        <Button variant="ghost" size="icon" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"}>{open ? <X /> : <Menu />}</Button>
      </div>
      {open && <div id="mobile-navigation" className="absolute inset-x-0 top-16 border-b border-border bg-surface p-4 shadow-sm"><NavigationLinks onNavigate={() => setOpen(false)} /></div>}
    </header>
  );
}
