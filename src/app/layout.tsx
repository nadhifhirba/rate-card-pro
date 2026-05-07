import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Playfair_Display, Source_Serif_4 } from "next/font/google";
import Link from "next/link";
import { Calculator, FileText, LayoutDashboard } from "lucide-react";

import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rate Card Pro — Editorial Freelancer Pricing",
  description: "Swiss-brutalist pricing tools for Indonesian freelancers.",
};

const navItems = [
  { href: "/builder", label: "Builder", icon: LayoutDashboard },
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/invoice", label: "Invoice", icon: FileText },
];

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <body className={`${playfair.variable} ${sourceSerif.variable} bg-[#0E0D0C] text-[#F0EBE0] antialiased`}>
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6 sm:px-10">
          {/* Header */}
          <header className="mb-20 flex items-center justify-between border-b border-[#2A2724] pb-6">
            <Link href="/" className="flex items-baseline gap-2 no-underline">
              <span
                className="text-xl font-bold tracking-tight text-[#F0EBE0]"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Rate Card{" "}
                <span style={{ fontStyle: "italic", color: "#C8A96E" }}>Pro</span>
              </span>
              <span className="hidden sm:inline text-[10px] uppercase tracking-[0.3em] text-[#7A7568]">
                Pricing
              </span>
            </Link>

            <nav className="flex items-center gap-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7A7568] transition-colors hover:text-[#C8A96E]"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          {children}

          {/* Footer */}
          <footer className="mt-auto border-t border-[#2A2724] pt-8 pb-4 text-center">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#4A4640]">
              Rate Card Pro · 2026
            </span>
          </footer>
        </div>
      </body>
    </html>
  );
}
