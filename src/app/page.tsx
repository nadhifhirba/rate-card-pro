"use client";

import Link from "next/link";
import { Calculator, FileText, LayoutDashboard, ArrowRight } from "lucide-react";

const tools = [
  {
    href: "/builder",
    icon: LayoutDashboard,
    number: "01",
    title: "Rate Card Builder",
    desc: "Atur kartu harga layanan Anda dengan visibilitas per item. Tampilkan atau sembunyikan harga sesuai kebutuhan klien.",
  },
  {
    href: "/calculator",
    icon: Calculator,
    number: "02",
    title: "Kalkulator Proyek",
    desc: "Pilih layanan, atur quantity, tambah diskon & pajak. Generate quote otomatis dengan kalkulasi real-time.",
  },
  {
    href: "/invoice",
    icon: FileText,
    number: "03",
    title: "Invoice Generator",
    desc: "Generate invoice profesional dari quote. Export sebagai PDF atau kirim langsung ke WhatsApp klien.",
  },
];

export default function Home() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="max-w-3xl space-y-6">
        <div className="gold-rule" />
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#C8A96E]">
          Freelancer Pricing
        </p>
        <h1 className="display-number">
          Your work,{" "}
          <span style={{ fontStyle: "italic" }}>priced</span>{" "}
          right.
        </h1>
        <p className="max-w-lg text-base leading-relaxed text-[#5C5A55]">
          Tools pricing lengkap untuk freelancer Indonesia. Buat rate card profesional,
          hitung proyek dengan kalkulator presisi, dan generate invoice siap kirim —
          semua dari satu dashboard elegan.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 rounded-full bg-[#1B1D2A] px-6 py-3 text-sm font-semibold text-[#F5F0E8] transition-all hover:bg-[#2D3040] hover:shadow-lg"
          >
            <LayoutDashboard size={16} />
            Mulai dengan Builder
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/calculator"
            className="inline-flex items-center gap-2 rounded-full border border-[#E0DBD0] px-6 py-3 text-sm font-semibold text-[#1B1D2A] transition-all hover:bg-white hover:shadow-sm"
          >
            <Calculator size={16} />
            Kalkulator
          </Link>
        </div>
      </section>

      {/* Tool grid */}
      <section className="grid gap-5 sm:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.href} href={tool.href} className="tool-card group flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5F0E8] text-[#1B1D2A] transition-colors group-hover:bg-[#C8A96E] group-hover:text-white"
                >
                  <Icon size={22} />
                </div>
                <span
                  className="text-3xl font-bold text-[#E0DBD0] transition-colors group-hover:text-[#C8A96E]"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {tool.number}
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-[#1B1D2A]" style={{ fontFamily: "var(--font-playfair)" }}>
                  {tool.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#5C5A55]">{tool.desc}</p>
              </div>
              <div className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-[#9C9890] transition-colors group-hover:text-[#C8A96E]">
                <span>Explore</span>
                <ArrowRight size={12} />
              </div>
            </Link>
          );
        })}
      </section>

      {/* Bottom quote */}
      <section className="border-t border-[#E0DBD0] pt-12 text-center">
        <blockquote
          className="max-w-lg mx-auto text-lg italic leading-relaxed text-[#5C5A55]"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          &ldquo;Know your worth. Then add tax.&rdquo;
        </blockquote>
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#9C9890]">
          — Rate Card Pro Philosophy
        </p>
      </section>
    </div>
  );
}
