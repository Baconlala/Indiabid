import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const pages = [
  { href: "/legal/about", label: "About" },
  { href: "/legal/rules", label: "Rules" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/refund-policy", label: "Refund & Cancellation" },
  { href: "/legal/privacy", label: "Privacy Policy" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-3xl flex-1 gap-10 px-4 py-8 pb-16 sm:px-6">
        <nav className="hidden w-40 shrink-0 flex-col gap-1 text-sm sm:flex">
          {pages.map((p) => (
            <Link key={p.href} href={p.href} className="rounded-lg px-2 py-1.5 text-muted hover:bg-surface hover:text-foreground">
              {p.label}
            </Link>
          ))}
        </nav>
        <article className="min-w-0 flex-1 flex flex-col gap-4 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-tight [&_h1]:text-foreground [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-foreground/85 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-sm [&_ul]:leading-relaxed [&_ul]:text-foreground/85 [&_li]:mt-1">
          {children}
        </article>
      </main>
      <Footer />
    </>
  );
}
