"use client";

import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { ChevronDown, ChevronRight, FileDown, Plus, Receipt, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Invoice, Quote } from "@/lib/store";

const f = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

const statusLabel: Record<Invoice["status"], string> = {
  draft: "Draft",
  sent: "Terkirim",
  paid: "Lunas",
};

const statusTone: Record<Invoice["status"], string> = {
  draft: "border-zinc-700 bg-zinc-950 text-zinc-300",
  sent: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  paid: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
};

const nextInvoiceNumber = (counter: number) => `INV-${String(counter + 1).padStart(3, "0")}`;

const toISODate = (d: Date) => d.toISOString().slice(0, 10);
const defaultDueDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return toISODate(d);
};

const fmtDate = (value: string) => {
  if (!value) return "—";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dt);
};

const blankDraft = (counter: number) => ({
  quoteId: "",
  clientName: "",
  clientCompany: "",
  clientAddress: "",
  dueDate: defaultDueDate(),
  bankName: "",
  bankAccount: "",
  bankHolder: "",
  ewallets: "",
  discount: 0,
  discountType: "%" as "%" | "fixed",
  taxRate: 11,
  items: [] as Quote["items"],
  createdAt: Date.now(),
  status: "draft" as Invoice["status"],
  draftNumber: nextInvoiceNumber(counter),
});

export default function InvoicePage() {
  const { profile, quotes, invoices, invoiceCounter, addInvoice, updateInvoice, removeInvoice } = useStore();
  const [mounted, setMounted] = useState(false);
  const [collapsedPreview, setCollapsedPreview] = useState(false);
  const [draft, setDraft] = useState(() => blankDraft(invoiceCounter));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!draft.quoteId) return;
    const q = quotes.find((x) => x.id === draft.quoteId);
    if (!q) return;
    setDraft((cur) => ({
      ...cur,
      items: q.items.map((i) => ({ ...i })),
      discount: q.discount,
      discountType: q.discountType,
      taxRate: q.taxRate,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotes]);

  const isPristine =
    !draft.quoteId &&
    !draft.clientName &&
    !draft.clientCompany &&
    !draft.clientAddress &&
    !draft.items.length &&
    !draft.bankName &&
    !draft.bankAccount &&
    !draft.bankHolder &&
    !draft.ewallets &&
    draft.discount === 0 &&
    draft.taxRate === 11;

  useEffect(() => {
    if (!mounted || !isPristine) return;
    setDraft((cur) => ({ ...cur, draftNumber: nextInvoiceNumber(invoiceCounter) }));
  }, [invoiceCounter, isPristine, mounted]);

  const selectedQuote = useMemo(() => quotes.find((q) => q.id === draft.quoteId) ?? null, [draft.quoteId, quotes]);

  const numbers = useMemo(() => {
    const subtotal = draft.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
    const discountValue =
      draft.discountType === "%"
        ? subtotal * (Math.max(0, draft.discount) / 100)
        : Math.min(Math.max(0, draft.discount), subtotal);
    const taxable = Math.max(0, subtotal - discountValue);
    const taxValue = taxable * (Math.max(0, draft.taxRate) / 100);
    const total = Math.max(0, taxable + taxValue);
    return { subtotal, discountValue, taxable, taxValue, total };
  }, [draft.discount, draft.discountType, draft.items, draft.taxRate]);

  const previewInvoice = useMemo(
    () => ({
      number: draft.draftNumber,
      quoteId: draft.quoteId,
      clientName: draft.clientName,
      clientCompany: draft.clientCompany,
      clientAddress: draft.clientAddress,
      dueDate: draft.dueDate,
      bankName: draft.bankName,
      bankAccount: draft.bankAccount,
      bankHolder: draft.bankHolder,
      ewallets: draft.ewallets,
      items: draft.items,
      discount: draft.discount,
      discountType: draft.discountType,
      taxRate: draft.taxRate,
      createdAt: draft.createdAt,
      status: draft.status,
    }),
    [draft]
  );

  const handleQuoteChange = (quoteId: string) => {
    if (!quoteId) {
      setDraft((cur) => ({
        ...blankDraft(invoiceCounter),
        clientName: cur.clientName,
        clientCompany: cur.clientCompany,
        clientAddress: cur.clientAddress,
        dueDate: cur.dueDate || defaultDueDate(),
        bankName: cur.bankName,
        bankAccount: cur.bankAccount,
        bankHolder: cur.bankHolder,
        ewallets: cur.ewallets,
      }));
      return;
    }

    const q = quotes.find((item) => item.id === quoteId);
    if (!q) return;

    setDraft((cur) => ({
      ...cur,
      quoteId,
      draftNumber: nextInvoiceNumber(invoiceCounter),
      items: q.items.map((item) => ({ ...item })),
      discount: q.discount,
      discountType: q.discountType,
      taxRate: q.taxRate,
      createdAt: Date.now(),
    }));
  };

  const updateItem = (index: number, patch: Partial<Quote["items"][number]>) => {
    setDraft((cur) => ({
      ...cur,
      items: cur.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  };

  const removeItem = (index: number) => {
    setDraft((cur) => ({
      ...cur,
      items: cur.items.filter((_, i) => i !== index),
    }));
  };

  const addItem = () => {
    setDraft((cur) => ({
      ...cur,
      items: [
        ...cur.items,
        {
          serviceId: "manual",
          serviceName: "Item Baru",
          qty: 1,
          unitPrice: 0,
        },
      ],
    }));
  };

  const saveInvoice = () => {
    if (!draft.clientName.trim() || !draft.items.length) return;

    addInvoice({
      id: "",
      number: draft.draftNumber,
      quoteId: draft.quoteId,
      clientName: draft.clientName.trim(),
      clientCompany: draft.clientCompany.trim(),
      clientAddress: draft.clientAddress.trim(),
      dueDate: draft.dueDate,
      bankName: draft.bankName.trim(),
      bankAccount: draft.bankAccount.trim(),
      bankHolder: draft.bankHolder.trim(),
      ewallets: draft.ewallets.trim(),
      items: draft.items.map((item) => ({ ...item })),
      discount: Math.max(0, draft.discount),
      discountType: draft.discountType,
      taxRate: Math.max(0, draft.taxRate),
      createdAt: draft.createdAt,
      status: "draft",
    });

    setDraft(blankDraft(invoiceCounter + 1));
  };

  const exportPdf = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const left = 14;
    const right = 14;
    const contentW = pageW - left - right;
    const accent: [number, number, number] = [255, 107, 0];
    const muted: [number, number, number] = [120, 120, 130];

    const drawHeader = () => {
      doc.setFillColor(...accent);
      doc.rect(left, 12, 18, 4, "F");
      doc.setTextColor(20, 20, 24);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("INVOICE", left, 24);

      doc.setTextColor(...muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(profile.name || "Rate Card Pro", left, 30);
      doc.text(profile.title || "Invoice Generator", left, 35);

      doc.setTextColor(20, 20, 24);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(previewInvoice.number, pageW - right, 24, { align: "right" });

      doc.setDrawColor(220, 220, 224);
      doc.line(left, 40, pageW - right, 40);
    };

    const drawItemHeader = (topY: number) => {
      doc.setFillColor(24, 24, 27);
      doc.rect(left, topY, contentW, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("ITEM", left + 2, topY + 5.5);
      doc.text("QTY", left + 106, topY + 5.5);
      doc.text("PRICE", left + 128, topY + 5.5);
      doc.text("AMOUNT", pageW - right - 2, topY + 5.5, { align: "right" });
      doc.setTextColor(20, 20, 24);
    };

    const ensureSpace = (needed: number, y: number, onNewPage?: () => number) => {
      if (y + needed <= pageH - 16) return y;
      doc.addPage();
      return onNewPage ? onNewPage() : 16;
    };

    let y = 12;
    drawHeader();
    y = 48;

    const pushLabelValue = (label: string, value: string, x: number, yy: number, width = 60) => {
      doc.setTextColor(...muted);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text(label, x, yy);
      doc.setTextColor(20, 20, 24);
      doc.setFont("helvetica", "normal");
      const wrapped = doc.splitTextToSize(value || "-", width);
      doc.text(wrapped, x, yy + 5);
      return yy + 5 + wrapped.length * 4.5;
    };

    doc.setFontSize(9);
    y = pushLabelValue("BILL TO", draft.clientName || "Nama klien", left, y, 90) + 2;
    if (draft.clientCompany) y = pushLabelValue("COMPANY", draft.clientCompany, left, y, 90) + 2;
    if (draft.clientAddress) y = pushLabelValue("ADDRESS", draft.clientAddress, left, y, 90) + 2;

    y = 48;
    y = pushLabelValue("DUE DATE", fmtDate(draft.dueDate), pageW / 2 + 8, y, 60) + 2;
    y = pushLabelValue("QUOTE", selectedQuote?.name || "Manual invoice", pageW / 2 + 8, y, 60) + 2;
    y = pushLabelValue("STATUS", statusLabel[draft.status], pageW / 2 + 8, y, 60) + 2;

    y = Math.max(y, 74);
    doc.setFillColor(24, 24, 27);
    doc.rect(left, y, contentW, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("ITEM", left + 2, y + 5.5);
    doc.text("QTY", left + 106, y + 5.5);
    doc.text("PRICE", left + 128, y + 5.5);
    doc.text("AMOUNT", pageW - right - 2, y + 5.5, { align: "right" });

    y += 12;
    doc.setTextColor(20, 20, 24);
    doc.setFont("helvetica", "normal");
    draft.items.forEach((item, index) => {
      const amount = item.qty * item.unitPrice;
      const wrapped = doc.splitTextToSize(item.serviceName, 95);
      const rowH = Math.max(8, wrapped.length * 4.6 + 2);
      y = ensureSpace(rowH + 2, y, () => {
        drawHeader();
        drawItemHeader(46);
        return 58;
      });
      doc.setDrawColor(228, 228, 231);
      doc.line(left, y + rowH + 1, pageW - right, y + rowH + 1);
      doc.setFont("helvetica", "bold");
      doc.text(wrapped, left + 2, y + 4.5);
      doc.setFont("helvetica", "normal");
      doc.text(String(item.qty), left + 107, y + 4.5);
      doc.text(f(item.unitPrice), left + 128, y + 4.5);
      doc.text(f(amount), pageW - right - 2, y + 4.5, { align: "right" });
      if (item.serviceId && item.serviceId !== "manual") {
        doc.setTextColor(...muted);
        doc.setFontSize(7.5);
        doc.text(`Ref ${index + 1}`, left + 2, y + rowH - 1);
        doc.setTextColor(20, 20, 24);
        doc.setFontSize(9);
      }
      y += rowH + 2;
    });

    y += 4;
    const summaryX = pageW - right - 70;
    const row = (label: string, value: string, isTotal = false) => {
      y = ensureSpace(isTotal ? 10 : 8, y, () => {
        drawHeader();
        return 48;
      });
      doc.setTextColor(...(isTotal ? accent : muted));
      doc.setFont("helvetica", isTotal ? "bold" : "normal");
      doc.setFontSize(isTotal ? 10 : 8.5);
      doc.text(label, summaryX, y);
      doc.text(value, pageW - right, y, { align: "right" });
      y += isTotal ? 6 : 5;
    };

    row("SUBTOTAL", f(numbers.subtotal));
    row(`DISKON ${draft.discountType === "%" ? `(${draft.discount}%)` : ""}`.trim(), f(numbers.discountValue));
    row(`PAJAK ${draft.taxRate}%`, f(numbers.taxValue));
    y += 1;
    row("TOTAL", f(numbers.total), true);

    y += 6;
    y = ensureSpace(26, y, () => {
      drawHeader();
      return 48;
    });
    doc.setDrawColor(220, 220, 224);
    doc.line(left, y, pageW - right, y);
    y += 6;
    doc.setTextColor(...muted);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("PAYMENT DETAILS", left, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 20, 24);
    doc.text(`Bank: ${draft.bankName || "-"}`, left, y);
    y += 5;
    doc.text(`Account: ${draft.bankAccount || "-"}`, left, y);
    y += 5;
    doc.text(`Holder: ${draft.bankHolder || "-"}`, left, y);
    y += 5;
    const ew = doc.splitTextToSize(`E-wallets: ${draft.ewallets || "-"}`, contentW);
    doc.text(ew, left, y);

    doc.save(`${previewInvoice.number.replace(/\s+/g, "_")}.pdf`);
  };

  const toggleStatus = (invoice: Invoice) => {
    const next = invoice.status === "draft" ? "sent" : invoice.status === "sent" ? "paid" : "draft";
    updateInvoice(invoice.id, { status: next });
  };

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <p className="font-mono text-sm text-zinc-500">Memuat data invoice…</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="h-[32rem] rounded-lg border border-zinc-800 bg-zinc-900" />
          <div className="h-[32rem] rounded-lg border border-zinc-800 bg-zinc-900" />
        </div>
      </div>
    );
  }

  const canSave = draft.clientName.trim().length > 0 && draft.items.length > 0;

  return (
    <div className="space-y-6">
      <div className="scanline rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-accent" />
              <h1 className="font-mono text-xl font-bold tracking-tight text-zinc-100">Invoice Generator</h1>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Buat invoice profesional dari quote tersimpan, cek preview realtime, lalu export PDF dengan satu klik.
            </p>
          </div>
          <div className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-400">
            Nomor berikutnya: <span className="text-accent">{nextInvoiceNumber(invoiceCounter)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-mono text-sm font-bold text-zinc-200">Sumber Quote</h2>
                <p className="text-xs text-zinc-500">Pilih quote untuk auto-populate item, diskon, dan pajak.</p>
              </div>
              <div className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-[11px] text-zinc-500">
                {quotes.length} quote
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="relative">
                <select
                  value={draft.quoteId}
                  onChange={(e) => handleQuoteChange(e.target.value)}
                  className="w-full appearance-none rounded border border-zinc-700 bg-zinc-950 px-3 py-2 pr-10 font-mono text-sm text-zinc-200 outline-none transition focus:border-accent"
                >
                  <option value="">Invoice manual / pilih quote</option>
                  {quotes.map((quote) => (
                    <option key={quote.id} value={quote.id}>
                      {quote.name} — {quote.items.length} item
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              </div>
              <button
                type="button"
                onClick={() => setDraft(blankDraft(invoiceCounter))}
                className="rounded border border-zinc-700 px-3 py-2 font-mono text-xs font-bold text-zinc-300 transition hover:border-accent/60 hover:text-white"
              >
                Reset Draft
              </button>
            </div>
            {selectedQuote ? (
              <div className="mt-3 rounded border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-200">
                Memakai quote: <span className="font-mono font-bold">{selectedQuote.name}</span>
              </div>
            ) : (
              <div className="mt-3 rounded border border-dashed border-zinc-800 bg-zinc-950/40 p-3 text-xs text-zinc-500">
                {quotes.length > 0
                  ? "Belum ada quote dipilih. Anda bisa isi invoice secara manual atau pilih quote tersimpan di atas."
                  : "Belum ada quote tersimpan. Invoice manual tetap bisa dibuat, namun item perlu ditambahkan sendiri."}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="font-mono text-sm font-bold text-zinc-200">Detail Klien</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                value={draft.clientName}
                onChange={(e) => setDraft((cur) => ({ ...cur, clientName: e.target.value }))}
                placeholder="Nama klien"
                className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-accent"
              />
              <input
                value={draft.clientCompany}
                onChange={(e) => setDraft((cur) => ({ ...cur, clientCompany: e.target.value }))}
                placeholder="Nama perusahaan"
                className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-accent"
              />
              <textarea
                value={draft.clientAddress}
                onChange={(e) => setDraft((cur) => ({ ...cur, clientAddress: e.target.value }))}
                placeholder="Alamat klien"
                rows={3}
                className="sm:col-span-2 rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-accent"
              />
            </div>
          </section>

          <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-mono text-sm font-bold text-zinc-200">Item Invoice</h2>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 rounded bg-accent px-3 py-2 font-mono text-xs font-bold text-black transition hover:bg-accent-light"
              >
                <Plus className="h-4 w-4" /> Tambah Item
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {draft.items.length === 0 ? (
                <div className="rounded border border-dashed border-zinc-800 bg-zinc-950/40 p-5 text-sm text-zinc-500">
                  Belum ada item. Pilih quote tersimpan atau tambahkan item manual.
                </div>
              ) : (
                draft.items.map((item, index) => (
                  <div key={`${item.serviceId}-${index}`} className="rounded border border-zinc-800 bg-zinc-950/60 p-3">
                    <div className="grid gap-2 md:grid-cols-[1.6fr_0.5fr_0.7fr_auto] md:items-end">
                      <div>
                        <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-zinc-500">Nama item</label>
                        <input
                          value={item.serviceName}
                          onChange={(e) => updateItem(index, { serviceName: e.target.value })}
                          className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 outline-none transition focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-zinc-500">Qty</label>
                        <input
                          type="number"
                          min={0}
                          value={item.qty}
                          onChange={(e) => updateItem(index, { qty: Number(e.target.value) || 0 })}
                          className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 outline-none transition focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-zinc-500">Harga / unit</label>
                        <input
                          type="number"
                          min={0}
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) || 0 })}
                          className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 outline-none transition focus:border-accent"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right font-mono text-xs text-zinc-500">
                          <div>Total</div>
                          <div className="text-sm text-accent">{f(item.qty * item.unitPrice)}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="rounded border border-zinc-700 p-2 text-zinc-500 transition hover:border-red-500/50 hover:text-red-400"
                          aria-label={`Hapus item ${item.serviceName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="font-mono text-sm font-bold text-zinc-200">Diskon, Pajak, dan Jatuh Tempo</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-zinc-500">Diskon</label>
                <input
                  type="number"
                  min={0}
                  value={draft.discount}
                  onChange={(e) => setDraft((cur) => ({ ...cur, discount: Number(e.target.value) || 0 }))}
                  className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 outline-none transition focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-zinc-500">Tipe Diskon</label>
                <select
                  value={draft.discountType}
                  onChange={(e) => setDraft((cur) => ({ ...cur, discountType: e.target.value as "%" | "fixed" }))}
                  className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 outline-none transition focus:border-accent"
                >
                  <option value="%">Persen (%)</option>
                  <option value="fixed">Nominal</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-zinc-500">Pajak (%)</label>
                <input
                  type="number"
                  min={0}
                  value={draft.taxRate}
                  onChange={(e) => setDraft((cur) => ({ ...cur, taxRate: Number(e.target.value) || 0 }))}
                  className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 outline-none transition focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-zinc-500">Due Date</label>
                <input
                  type="date"
                  value={draft.dueDate}
                  onChange={(e) => setDraft((cur) => ({ ...cur, dueDate: e.target.value }))}
                  className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 outline-none transition focus:border-accent"
                />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="font-mono text-sm font-bold text-zinc-200">Payment Details</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                value={draft.bankName}
                onChange={(e) => setDraft((cur) => ({ ...cur, bankName: e.target.value }))}
                placeholder="Nama bank"
                className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-accent"
              />
              <input
                value={draft.bankAccount}
                onChange={(e) => setDraft((cur) => ({ ...cur, bankAccount: e.target.value }))}
                placeholder="Nomor rekening"
                className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-accent"
              />
              <input
                value={draft.bankHolder}
                onChange={(e) => setDraft((cur) => ({ ...cur, bankHolder: e.target.value }))}
                placeholder="Nama pemilik rekening"
                className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-accent"
              />
              <input
                value={draft.ewallets}
                onChange={(e) => setDraft((cur) => ({ ...cur, ewallets: e.target.value }))}
                placeholder="E-wallets (OVO, DANA, GoPay, dll.)"
                className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-accent"
              />
            </div>
          </section>

          <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-mono text-sm font-bold text-zinc-200">Aksi Invoice</h2>
                <p className="text-xs text-zinc-500">Simpan invoice ke daftar, lalu export PDF siap kirim.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveInvoice}
                  disabled={!canSave}
                  className="rounded bg-accent px-4 py-2 font-mono text-xs font-bold text-black transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Simpan Invoice
                </button>
                <button
                  type="button"
                  onClick={exportPdf}
                  disabled={!canSave}
                  className="flex items-center gap-2 rounded border border-zinc-700 px-4 py-2 font-mono text-xs font-bold text-zinc-200 transition hover:border-accent/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FileDown className="h-4 w-4" /> Export PDF
                </button>
              </div>
            </div>
            {!canSave && (
              <p className="mt-3 rounded border border-dashed border-zinc-800 bg-zinc-950/40 p-3 text-xs text-zinc-500">
                Isi minimal nama klien dan satu item invoice untuk menyimpan atau export.
              </p>
            )}
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-mono text-sm font-bold text-zinc-200">Preview Invoice</h2>
                <p className="text-xs text-zinc-500">Tampilan final yang akan masuk ke PDF.</p>
              </div>
              <button
                type="button"
                onClick={() => setCollapsedPreview((v) => !v)}
                className="flex items-center gap-1 rounded border border-zinc-700 px-2 py-1 font-mono text-[11px] text-zinc-400 transition hover:border-accent/60 hover:text-zinc-100"
              >
                {collapsedPreview ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {collapsedPreview ? "Buka" : "Tutup"}
              </button>
            </div>

            {!collapsedPreview && (
              <div className="mt-4 overflow-hidden rounded border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-3">
                  <div>
                    <div className="h-1.5 w-16 bg-accent" />
                    <h3 className="mt-3 font-mono text-lg font-bold text-zinc-100">
                      {profile.name || "Nama Bisnis Anda"}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">{profile.title || "Tulis deskripsi singkat profil Anda"}</p>
                  </div>
                  <div className="text-right font-mono text-xs text-zinc-500">
                    <div>No. Invoice</div>
                    <div className="text-sm font-bold text-accent">{previewInvoice.number}</div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">Bill To</div>
                    <div className="mt-2 font-mono text-sm text-zinc-100">{draft.clientName || "Nama klien"}</div>
                    <div className="font-mono text-xs text-zinc-500">{draft.clientCompany || "Nama perusahaan"}</div>
                    <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-400">{draft.clientAddress || "Alamat klien"}</div>
                  </div>
                  <div className="sm:text-right">
                    <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">Detail</div>
                    <div className="mt-2 space-y-1 font-mono text-xs text-zinc-400">
                      <div>Quote: {selectedQuote?.name || "Manual invoice"}</div>
                      <div>Due date: {fmtDate(draft.dueDate)}</div>
                      <div>Status: {statusLabel[draft.status]}</div>
                      <div>Invoice date: {fmtDate(toISODate(new Date(draft.createdAt)))}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden border border-zinc-800">
                  <div className="grid grid-cols-[1.6fr_0.35fr_0.5fr_0.65fr] gap-2 border-b border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                    <div>Item</div>
                    <div className="text-right">Qty</div>
                    <div className="text-right">Harga</div>
                    <div className="text-right">Jumlah</div>
                  </div>
                  <div className="divide-y divide-zinc-800">
                    {draft.items.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-zinc-500">Belum ada item.</div>
                    ) : (
                      draft.items.map((item) => (
                        <div key={`${item.serviceId}-${item.serviceName}`} className="grid grid-cols-[1.6fr_0.35fr_0.5fr_0.65fr] gap-2 px-3 py-3 text-sm">
                          <div>
                            <div className="font-mono text-zinc-100">{item.serviceName}</div>
                            <div className="text-xs text-zinc-500">{item.serviceId === "manual" ? "Manual item" : item.serviceId}</div>
                          </div>
                          <div className="text-right font-mono text-zinc-300">{item.qty}</div>
                          <div className="text-right font-mono text-zinc-300">{f(item.unitPrice)}</div>
                          <div className="text-right font-mono text-zinc-100">{f(item.qty * item.unitPrice)}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_16rem]">
                  <div className="rounded border border-zinc-800 bg-zinc-900/60 p-3 text-xs leading-6 text-zinc-400">
                    <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">Payment details</div>
                    <div className="mt-2 space-y-1">
                      <div>Bank: {draft.bankName || "-"}</div>
                      <div>Account: {draft.bankAccount || "-"}</div>
                      <div>Holder: {draft.bankHolder || "-"}</div>
                      <div>E-wallets: {draft.ewallets || "-"}</div>
                    </div>
                  </div>
                  <div className="space-y-2 rounded border border-zinc-800 bg-zinc-900/60 p-3 font-mono text-xs">
                    <div className="flex items-center justify-between text-zinc-500"><span>Subtotal</span><span>{f(numbers.subtotal)}</span></div>
                    <div className="flex items-center justify-between text-zinc-500"><span>Diskon</span><span>{f(numbers.discountValue)}</span></div>
                    <div className="flex items-center justify-between text-zinc-500"><span>Pajak</span><span>{f(numbers.taxValue)}</span></div>
                    <div className="mt-2 flex items-center justify-between border-t border-zinc-800 pt-2 text-sm font-bold text-accent"><span>Total</span><span>{f(numbers.total)}</span></div>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-mono text-sm font-bold text-zinc-200">Saved Invoices</h2>
                <p className="text-xs text-zinc-500">Klik status untuk toggle draft → sent → paid.</p>
              </div>
              <div className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-[11px] text-zinc-500">{invoices.length} tersimpan</div>
            </div>

            <div className="mt-3 space-y-3">
              {invoices.length === 0 ? (
                <div className="rounded border border-dashed border-zinc-800 bg-zinc-950/40 p-5 text-sm text-zinc-500">
                  Belum ada invoice tersimpan. Simpan draft pertama Anda untuk muncul di sini.
                </div>
              ) : (
                invoices
                  .slice()
                  .reverse()
                  .map((invoice) => (
                    <div key={invoice.id} className="rounded border border-zinc-800 bg-zinc-950/60 p-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="font-mono text-sm font-bold text-zinc-100">{invoice.number}</div>
                            <button
                              type="button"
                              onClick={() => toggleStatus(invoice)}
                              className={`rounded-full border px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider transition ${statusTone[invoice.status]}`}
                            >
                              {statusLabel[invoice.status]}
                            </button>
                          </div>
                          <div className="mt-1 truncate text-sm text-zinc-300">{invoice.clientName || "Nama klien"}</div>
                          <div className="mt-1 text-xs text-zinc-500">
                            {invoice.clientCompany || "-"} · Jatuh tempo {fmtDate(invoice.dueDate)}
                          </div>
                          <div className="mt-2 text-xs text-zinc-500">
                            Total: <span className="font-mono text-accent">{(() => {
                              const subtotal = invoice.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
                              const discountValue =
                                invoice.discountType === "%"
                                  ? subtotal * (Math.max(0, invoice.discount) / 100)
                                  : Math.min(Math.max(0, invoice.discount), subtotal);
                              const taxable = Math.max(0, subtotal - discountValue);
                              const taxValue = taxable * (Math.max(0, invoice.taxRate) / 100);
                              return f(Math.max(0, taxable + taxValue));
                            })()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start">
                          <button
                            type="button"
                            onClick={() => setDraft({
                              quoteId: invoice.quoteId,
                              clientName: invoice.clientName,
                              clientCompany: invoice.clientCompany,
                              clientAddress: invoice.clientAddress,
                              dueDate: invoice.dueDate,
                              bankName: invoice.bankName,
                              bankAccount: invoice.bankAccount,
                              bankHolder: invoice.bankHolder,
                              ewallets: invoice.ewallets,
                              discount: invoice.discount,
                              discountType: invoice.discountType,
                              taxRate: invoice.taxRate,
                              items: invoice.items.map((item) => ({ ...item })),
                              createdAt: invoice.createdAt,
                              status: invoice.status,
                              draftNumber: invoice.number,
                            })}
                            className="rounded border border-zinc-700 px-3 py-2 font-mono text-xs text-zinc-300 transition hover:border-accent/60 hover:text-white"
                          >
                            Buka
                          </button>
                          <button
                            type="button"
                            onClick={() => removeInvoice(invoice.id)}
                            className="rounded border border-zinc-700 p-2 text-zinc-500 transition hover:border-red-500/50 hover:text-red-400"
                            aria-label={`Hapus invoice ${invoice.number}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
