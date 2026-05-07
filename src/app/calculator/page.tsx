"use client";

import { useState, useMemo } from "react";
import { Calculator, Plus, Trash2, Save } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Quote } from "@/lib/store";

export default function CalculatorPage() {
  const { services, quotes, addQuote, removeQuote } = useStore();
  const [quoteName, setQuoteName] = useState("");
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"%" | "fixed">("%");
  const [taxRate, setTaxRate] = useState(11);
  const [saved, setSaved] = useState(false);

  const visible = services.filter((s) => s.visible);

  const toggleService = (id: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = 1;
      return next;
    });
    setSaved(false);
  };

  const items = useMemo(() => {
    return Object.entries(selected).map(([serviceId, qty]) => {
      const s = services.find((sv) => sv.id === serviceId)!;
      return { serviceId: s.id, serviceName: s.name, qty, unitPrice: s.price };
    });
  }, [selected, services]);

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const discAmt = discountType === "%" ? Math.round(subtotal * (discount / 100)) : discount;
  const afterDisc = Math.max(0, subtotal - discAmt);
  const taxAmt = Math.round(afterDisc * (taxRate / 100));
  const grandTotal = afterDisc + taxAmt;

  const formatIDR = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

  const handleSave = () => {
    if (!quoteName || items.length === 0) return;
    addQuote({ id: "", name: quoteName, items, discount, discountType, taxRate, createdAt: Date.now() });
    setSaved(true);
    setQuoteName("");
    setSelected({});
  };

  return (
    <div className="space-y-6">
      <h2 className="font-mono text-lg font-bold tracking-tight text-accent">Kalkulator Proyek</h2>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <input value={quoteName} onChange={(e) => { setQuoteName(e.target.value); setSaved(false); }} placeholder="Nama proyek/quote..." className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-accent focus:outline-none" />
      </div>

      <div className="space-y-2">
        <p className="font-mono text-xs text-zinc-500">Pilih layanan dari Rate Card:</p>
        {visible.map((s) => (
          <div
            key={s.id}
            onClick={() => toggleService(s.id)}
            className={`flex cursor-pointer items-center justify-between rounded border px-4 py-3 transition-all ${
              selected[s.id] ? "border-accent bg-accent/5" : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
            }`}
          >
            <div>
              <span className="font-mono text-sm font-bold text-zinc-200">{s.name}</span>
              <span className="ml-2 font-mono text-xs text-accent">{formatIDR(s.price)} / {s.unit}</span>
            </div>
            {selected[s.id] && (
              <input
                type="number"
                min={1}
                value={selected[s.id]}
                onChange={(e) => setSelected({ ...selected, [s.id]: Math.max(1, Number(e.target.value) || 1) })}
                onClick={(e) => e.stopPropagation()}
                className="w-16 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 font-mono text-sm text-zinc-200 text-center focus:border-accent focus:outline-none"
              />
            )}
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="mb-1 block font-mono text-xs text-zinc-400">Diskon</label>
                <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-200 focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block font-mono text-xs text-zinc-400">Tipe</label>
                <select value={discountType} onChange={(e) => setDiscountType(e.target.value as "%" | "fixed")} className="rounded border border-zinc-700 bg-zinc-950 px-2 py-2 font-mono text-sm text-zinc-200">
                  <option value="%">%</option>
                  <option value="fixed">IDR</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block font-mono text-xs text-zinc-400">Pajak %</label>
                <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-20 rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-200 focus:border-accent focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-accent/30 bg-zinc-950 p-4 space-y-2">
            <div className="flex justify-between font-mono text-sm"><span className="text-zinc-400">Subtotal</span><span>{formatIDR(subtotal)}</span></div>
            {discAmt > 0 && <div className="flex justify-between font-mono text-sm"><span className="text-zinc-400">Diskon {discountType === "%" ? `(${discount}%)` : ""}</span><span className="text-red-400">-{formatIDR(discAmt)}</span></div>}
            {taxAmt > 0 && <div className="flex justify-between font-mono text-sm"><span className="text-zinc-400">PPN ({taxRate}%)</span><span>{formatIDR(taxAmt)}</span></div>}
            <hr className="border-zinc-800" />
            <div className="flex justify-between font-mono text-lg font-bold text-accent"><span>Grand Total</span><span>{formatIDR(grandTotal)}</span></div>
          </div>

          <button onClick={handleSave} disabled={!quoteName || saved} className="flex w-full items-center justify-center gap-2 rounded bg-accent px-4 py-2 font-mono text-sm font-bold text-black hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            <Save className="h-4 w-4" /> {saved ? "Quote Tersimpan!" : "Simpan Quote"}
          </button>
        </div>
      )}

      {quotes.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-mono text-xs font-bold text-zinc-500 uppercase">Quote Tersimpan</h3>
          {quotes.map((q) => {
            const total = q.items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
            const d = q.discountType === "%" ? Math.round(total * (q.discount / 100)) : q.discount;
            const after = Math.max(0, total - d);
            const tax = Math.round(after * (q.taxRate / 100));
            return (
              <div key={q.id} className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/50 px-4 py-2">
                <div>
                  <span className="font-mono text-sm text-zinc-200">{q.name}</span>
                  <span className="ml-2 font-mono text-xs text-zinc-500">{q.items.length} item • {formatIDR(after + tax)}</span>
                </div>
                <button onClick={() => removeQuote(q.id)} className="text-zinc-600 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
