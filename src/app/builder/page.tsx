"use client";

import { useState } from "react";
import { Plus, Eye, EyeOff, Edit3, Trash2, Save } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Service, Profile } from "@/lib/store";

export default function BuilderPage() {
  const { services, profile, addService, updateService, removeService, updateProfile } = useStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newService, setNewService] = useState({ name: "", description: "", price: "", unit: "per proyek", category: "Umum" });

  const [editProfile, setEditProfile] = useState(false);

  const handleAdd = () => {
    if (!newService.name || !newService.price) return;
    addService({ id: "", ...newService, price: Number(newService.price), visible: true });
    setNewService({ name: "", description: "", price: "", unit: "per proyek", category: "Umum" });
    setShowAdd(false);
  };

  const grouped = services.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, Service[]>);

  const formatIDR = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-lg font-bold tracking-tight text-accent">Rate Card Builder</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 rounded bg-accent px-3 py-2 font-mono text-xs font-bold text-black hover:bg-accent-light">
          <Plus className="h-4 w-4" /> Layanan
        </button>
      </div>

      {editProfile ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-3">
          <input value={profile.name} onChange={(e) => updateProfile({ name: e.target.value })} placeholder="Nama" className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-accent focus:outline-none" />
          <input value={profile.title} onChange={(e) => updateProfile({ title: e.target.value })} placeholder="Title (e.g., UI/UX Designer)" className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-accent focus:outline-none" />
          <textarea value={profile.bio} onChange={(e) => updateProfile({ bio: e.target.value })} placeholder="Bio singkat" rows={2} className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-accent focus:outline-none" />
          <div className="grid grid-cols-2 gap-2">
            <input value={profile.email} onChange={(e) => updateProfile({ email: e.target.value })} placeholder="Email" className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-accent focus:outline-none" />
            <input value={profile.phone} onChange={(e) => updateProfile({ phone: e.target.value })} placeholder="WhatsApp" className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-accent focus:outline-none" />
          </div>
          <button onClick={() => setEditProfile(false)} className="rounded bg-accent px-3 py-2 font-mono text-xs font-bold text-black">Simpan Profil</button>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 flex items-center justify-between cursor-pointer hover:border-accent/50" onClick={() => setEditProfile(true)}>
          <div>
            <p className="font-mono text-sm font-bold text-zinc-200">{profile.name || "Profil Anda"}</p>
            <p className="font-mono text-xs text-zinc-500">{profile.title || "Klik untuk edit profil"}</p>
          </div>
          <Edit3 className="h-4 w-4 text-zinc-600" />
        </div>
      )}

      {showAdd && (
        <div className="rounded-lg border border-accent/30 bg-zinc-900 p-4 space-y-3">
          <input value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} placeholder="Nama Layanan" className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-accent focus:outline-none" />
          <input value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} placeholder="Deskripsi" className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-accent focus:outline-none" />
          <div className="grid grid-cols-3 gap-2">
            <input value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} type="number" placeholder="Harga (IDR)" className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-accent focus:outline-none" />
            <input value={newService.unit} onChange={(e) => setNewService({ ...newService, unit: e.target.value })} placeholder="Unit" className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-accent focus:outline-none" />
            <input value={newService.category} onChange={(e) => setNewService({ ...newService, category: e.target.value })} placeholder="Kategori" className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-accent focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="rounded bg-accent px-3 py-2 font-mono text-xs font-bold text-black">Tambah</button>
            <button onClick={() => setShowAdd(false)} className="rounded border border-zinc-700 px-3 py-2 font-mono text-xs text-zinc-400">Batal</button>
          </div>
        </div>
      )}

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="space-y-2">
          <h3 className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-wider">{cat}</h3>
          {items.map((s) => (
            <div key={s.id} className={`flex items-center justify-between rounded border bg-zinc-900/50 px-4 py-3 transition-all ${s.visible ? "border-zinc-800" : "border-zinc-800/30 opacity-50"}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-zinc-200">{s.name}</span>
                  {!s.visible && <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">Hidden</span>}
                </div>
                <p className="font-mono text-xs text-zinc-500">{s.description}</p>
                <p className="font-mono text-xs text-accent">{formatIDR(s.price)} / {s.unit}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => updateService(s.id, { visible: !s.visible })} className="rounded p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors">
                  {s.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={() => removeService(s.id)} className="rounded p-1.5 text-zinc-500 hover:text-red-400 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {services.length === 0 && (
        <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center">
          <LayoutDashboard className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
          <p className="font-mono text-sm text-zinc-500">Belum ada layanan. Tambahkan layanan pertama Anda.</p>
        </div>
      )}
    </div>
  );
}
