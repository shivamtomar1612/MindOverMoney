import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-3xl place-items-center px-5 py-16 text-center sm:px-8">
      <section className="border-y border-border py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Page not found</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">This page is outside the demo.</h1>
        <p className="mx-auto mt-4 max-w-lg leading-7 text-muted-foreground">Return to Explore to continue with the simulated Indian-market assets.</p>
        <Link href="/explore" className={`${buttonVariants()} mt-7`}><ArrowLeft className="size-4" aria-hidden="true" />Back to Explore</Link>
      </section>
    </main>
  );
}
