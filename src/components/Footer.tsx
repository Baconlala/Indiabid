import Link from "next/link";
import IndiaFlag from "./IndiaFlag";

const legalLinks = [
  { href: "/legal/about", label: "About" },
  { href: "/legal/rules", label: "Rules" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/refund-policy", label: "Refund Policy" },
  { href: "/legal/privacy", label: "Privacy" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <IndiaFlag className="h-4 w-6" />
          <span className="text-sm font-bold">
            India<span className="text-saffron">Bid</span>
          </span>
          <span className="text-xs text-muted">— Made in India, For India</span>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
