import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Playfair_Display, Source_Serif_4 } from "next/font/google";
import Link from "next/link";

import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"], weight: ["400", "600", "700"],
  variable: "--font-playfair", display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"], weight: ["400", "500", "600", "700"],
  variable: "--font-source-serif", display: "swap",
});

export const metadata: Metadata = {
  title: "Rate Card Pro — Freelancer Pricing",
  description: "Pricing tools for Indonesian freelancers. Rate cards, project calculator, invoice generator.",
};

const navItems = [
  { href: "/builder", label: "Builder" },
  { href: "/calculator", label: "Calculator" },
  { href: "/invoice", label: "Invoice" },
];

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${playfair.variable} ${sourceSerif.variable}`}>
        <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-6 sm:px-10">
          <header className="mb-16 flex items-center justify-between border-b border-[#E0DBD0] pb-6">
            <Link href="/" className="flex flex-col gap-1">
              <span className="text-xl font-bold tracking-tight text-[#1B1D2A]" style={{ fontFamily: "var(--font-playfair)" }}>
                Rate Card <span style={{ fontStyle: "italic", color: "#C8A96E" }}>Pro</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#9C9890]">
                Freelancer Pricing System
              </span>
            </Link>
            <nav className="flex items-center gap-6">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link">
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-24 border-t border-[#E0DBD0] pt-6 text-center text-[11px] text-[#9C9890] uppercase tracking-[0.15em]">
            Rate Card Pro · Made for Indonesian freelancers · 2026
          </footer>
        </div>
      </body>
    </html>
  );
}
