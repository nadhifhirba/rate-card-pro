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
    <div className="space-y-28">
      {/* ═══ HERO ═══ */}
      <section className="relative">
        {/* Ambient glow */}
        <div className="hero-glow left-0 top-0 h-96 w-96" style={{ background: "var(--gold)" }} />

        <div className="relative z-10 max-w-3xl space-y-8">
          <div className="gold-rule" />
          
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C8A96E]">
            Editorial Freelancer Pricing
          </p>

          <h1 className="display-number">
            Your work,{" "}
            <em>priced</em>{" "}
            right.
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-[#7A7568] font-medium">
            Tools pricing lengkap untuk freelancer Indonesia. Buat rate card profesional,
            hitung proyek dengan kalkulator presisi, dan generate invoice siap kirim — 
            semua dari satu dashboard.
          </p>

          <div className="flex flex-wrap gap-3 pt-4">
            <Link href="/builder" className="btn-editorial">
              <LayoutDashboard size={16} />
              Mulai dengan Builder
              <ArrowRight size={16} />
            </Link>
            <Link href="/calculator" className="btn-editorial btn-editorial-secondary">
              <Calculator size={16} />
              Kalkulator
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ TOOL GRID ═══ */}
      <section>
        <div className="mb-8 flex items-center gap-4">
          <div className="gold-rule-vertical" />
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7A7568]">
            Tools
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.href} href={tool.href} className="tool-card group flex flex-col gap-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center border border-[#2A2724] text-[#C8A96E] transition-colors group-hover:border-[#C8A96E] group-hover:bg-[#C8A96E]/10">
                    <Icon size={18} />
                  </div>
                  <span className="tool-number">{tool.number}</span>
                </div>

                <div className="space-y-2">
                  <h3
                    className="text-lg font-bold text-[#F0EBE0]"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {tool.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#7A7568] line-clamp-3">
                    {tool.desc}
                  </p>
                </div>

                <div className="mt-auto flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#4A4640] transition-colors group-hover:text-[#C8A96E]">
                  <span>Explore</span>
                  <ArrowRight size={12} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══ BOTTOM: MANIFESTO ═══ */}
      <section className="border-t border-[#2A2724] pt-16">
        <div className="mx-auto max-w-2xl space-y-6">
          <blockquote className="blockquote-large">
            &ldquo;Know your worth.
            <br />
            Then add tax.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="gold-rule" style={{ width: 40 }} />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4A4640]">
              Rate Card Pro Philosophy
            </p>
          </div>
        </div>
      </section>

      <div className="h-8" />
    </div>
  );
}
