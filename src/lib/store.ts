import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  visible: boolean;
}

export interface Profile {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  photoUrl: string;
}

export interface Quote {
  id: string;
  name: string;
  items: { serviceId: string; serviceName: string; qty: number; unitPrice: number }[];
  discount: number;
  discountType: "%" | "fixed";
  taxRate: number;
  createdAt: number;
}

export interface Invoice {
  id: string;
  number: string;
  quoteId: string;
  clientName: string;
  clientCompany: string;
  clientAddress: string;
  dueDate: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  ewallets: string;
  items: Quote["items"];
  discount: number;
  discountType: "%" | "fixed";
  taxRate: number;
  createdAt: number;
  status: "draft" | "sent" | "paid";
}

interface AppState {
  services: Service[];
  profile: Profile;
  quotes: Quote[];
  invoices: Invoice[];
  invoiceCounter: number;
  addService: (s: Service) => void;
  updateService: (id: string, s: Partial<Service>) => void;
  removeService: (id: string) => void;
  updateProfile: (p: Partial<Profile>) => void;
  addQuote: (q: Quote) => void;
  removeQuote: (id: string) => void;
  addInvoice: (inv: Invoice) => void;
  updateInvoice: (id: string, inv: Partial<Invoice>) => void;
  removeInvoice: (id: string) => void;
  incrementCounter: () => number;
}

let c = Date.now();
const uid = () => `${++c}`;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      services: [],
      profile: { name: "", title: "", bio: "", email: "", phone: "", photoUrl: "" },
      quotes: [],
      invoices: [],
      invoiceCounter: 0,

      addService: (s) => set((st) => ({ services: [...st.services, { ...s, id: uid() }] })),
      updateService: (id, s) => set((st) => ({ services: st.services.map((sv) => sv.id === id ? { ...sv, ...s } : sv) })),
      removeService: (id) => set((st) => ({ services: st.services.filter((s) => s.id !== id) })),
      updateProfile: (p) => set((st) => ({ profile: { ...st.profile, ...p } })),

      addQuote: (q) => set((st) => ({ quotes: [...st.quotes, { ...q, id: uid() }] })),
      removeQuote: (id) => set((st) => ({ quotes: st.quotes.filter((q) => q.id !== id) })),

      addInvoice: (inv) => {
        const num = get().invoiceCounter + 1;
        set((st) => ({
          invoices: [...st.invoices, { ...inv, id: uid(), number: `INV-${String(num).padStart(3, "0")}` }],
          invoiceCounter: num,
        }));
      },
      updateInvoice: (id, inv) => set((st) => ({ invoices: st.invoices.map((i) => i.id === id ? { ...i, ...inv } : i) })),
      removeInvoice: (id) => set((st) => ({ invoices: st.invoices.filter((i) => i.id !== id) })),
      incrementCounter: () => { const n = get().invoiceCounter + 1; set({ invoiceCounter: n }); return n; },
    }),
    { name: "rate-card-pro" }
  )
);
