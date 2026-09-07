"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import IndiaFlag from "./IndiaFlag";
import LiveCounter from "./LiveCounter";
import MobileMenu from "./MobileMenu";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <IndiaFlag className="h-5 w-7" />
            <span className="text-lg font-black tracking-tight">
              India<span className="text-saffron">Bid</span>
            </span>
          </Link>
          <span className="hidden sm:block">
            <LiveCounter />
          </span>
        </div>
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
          <Link
            href="/daily"
            className={`hidden rounded-full px-3 py-1.5 transition-colors sm:inline ${
              pathname.startsWith("/daily") ? "text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            🔥 Daily
          </Link>
          <Link
            href="/blog"
            className={`hidden rounded-full px-3 py-1.5 transition-colors sm:inline ${
              pathname.startsWith("/blog") ? "text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            Blog
          </Link>
          <MobileMenu />
          <ThemeToggle />
          <Link
            href="/submit"
            aria-label="Add a listing"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-90 sm:hidden"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Link>
          <Link
            href="/submit"
            className="hidden rounded-full bg-foreground px-4 py-1.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 sm:inline-block"
          >
            Add a listing
          </Link>
        </nav>
      </div>
    </header>
  );
}
