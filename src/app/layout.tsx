import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rate Card Pro",
  description: "Kartu harga, kalkulator proyek, & invoice generator untuk freelancer Indonesia",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-screen antialiased">
        <header className="scanline border-b border-zinc-800 bg-zinc-950 px-4 py-3">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <a href="/" className="font-mono text-sm font-bold tracking-wider text-accent">
              RATE<span className="text-zinc-500">_CARD</span><span className="text-zinc-600">_PRO</span>
            </a>
            <nav className="flex gap-4 font-mono text-xs text-zinc-400">
              <a href="/builder" className="hover:text-accent transition-colors">Builder</a>
              <a href="/calculator" className="hover:text-accent transition-colors">Kalkulator</a>
              <a href="/invoice" className="hover:text-accent transition-colors">Invoice</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
