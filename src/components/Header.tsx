"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import IndiaFlag from "./IndiaFlag";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <IndiaFlag className="h-5 w-7" />
          <span className="text-lg font-black tracking-tight">
            India<span className="text-saffron">Bid</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium sm:gap-4">
          <Link
            href="/"
            className={`hidden rounded-full px-3 py-1.5 transition-colors sm:inline ${
              pathname === "/" ? "text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            National
          </Link>
          <Link
            href="/local"
            className={`hidden rounded-full px-3 py-1.5 transition-colors sm:inline ${
              pathname.startsWith("/local") ? "text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            Local
          </Link>
          <ThemeToggle />
          <Link
            href="/submit"
            className="rounded-full bg-foreground px-4 py-1.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Add a listing
          </Link>
        </nav>
      </div>
    </header>
  );
}
