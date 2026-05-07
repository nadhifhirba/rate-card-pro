"use client";

import { LayoutDashboard, Calculator, Receipt, FileText } from "lucide-react";

const cards = [
  { href: "/builder", icon: LayoutDashboard, title: "Rate Card Builder", desc: "Buat dan atur kartu harga layanan Anda. Atur visibilitas per item." },
  { href: "/calculator", icon: Calculator, title: "Kalkulator Proyek", desc: "Pilih layanan, atur quantity, tambah diskon & pajak. Generate quote otomatis." },
  { href: "/invoice", icon: Receipt, title: "Invoice Generator", desc: "Generate invoice profesional dari quote. Export PDF atau WhatsApp." },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="scanline rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h1 className="font-mono text-2xl font-bold tracking-tight">
          <span className="text-accent">Rate Card Pro</span>
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Tools pricing lengkap untuk freelancer Indonesia. Buat rate card, hitung proyek, 
          dan generate invoice — semua dari satu dashboard.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <a key={c.href} href={c.href} className="group rounded-lg border border-zinc-800 bg-zinc-900 p-5 transition-all hover:border-accent/50">
            <c.icon className="mb-3 h-8 w-8 text-accent" />
            <h3 className="font-mono text-sm font-bold text-zinc-200">{c.title}</h3>
            <p className="mt-1 text-xs text-zinc-500">{c.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
