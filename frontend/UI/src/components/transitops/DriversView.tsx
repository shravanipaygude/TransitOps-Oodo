import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, User, IdCard, Shield, Phone, CalendarClock, AlertTriangle } from "lucide-react";
import { useStore, canManage, isLicenseExpired, type DriverStatus } from "@/lib/store";
import { GlassCard, StatusPill, SectionHeader } from "./primitives";
import { Modal, Field, inputCls } from "./Modal";

export function DriversView() {
  const { drivers, role, addDriver } = useStore();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"All" | DriverStatus | "Expired">("All");

  const list = useMemo(() => drivers.filter((d) => {
    if (filter === "All") return true;
    if (filter === "Expired") return isLicenseExpired(d);
    return d.status === filter;
  }), [drivers, filter]);

  return (
    <div>
      <SectionHeader
        title="Driver Roster"
        subtitle="Certified operators · license compliance · safety scoring"
        action={
          canManage(role) && (
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--cyan)] px-4 py-2 text-sm font-semibold text-[color:var(--primary-foreground)] transition hover:brightness-110 pulse-glow"
            >
              <Plus className="h-4 w-4" /> Register Driver
            </button>
          )
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {(["All", "Available", "On Trip", "Off Duty", "Suspended", "Expired"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              filter === f ? "bg-[color:var(--cyan)] text-[color:var(--primary-foreground)]" : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((d) => {
          const expired = isLicenseExpired(d);
          const daysToExpiry = Math.round((new Date(d.licenseExpiry).getTime() - Date.now()) / 86400000);
          const expiringSoon = !expired && daysToExpiry <= 30;
          return (
            <GlassCard key={d.id} hover>
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[color:var(--cyan)]/25 to-[color:var(--primary)]/25 font-bold text-[color:var(--cyan)]">
                    {d.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{d.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1"><IdCard className="h-3 w-3" />{d.license} · {d.licenseCategory}</div>
                  </div>
                </div>
                <StatusPill status={d.status} />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Contact</span>
                  <span className="font-mono">{d.contact}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1"><CalendarClock className="h-3 w-3" /> License Expiry</span>
                  <span className={`font-mono ${expired ? "text-[color:var(--coral)]" : expiringSoon ? "text-[color:var(--amber)]" : ""}`}>{d.licenseExpiry}</span>
                </div>
              </div>
              {(expired || expiringSoon) && (
                <div className={`mt-3 flex items-center gap-2 rounded-lg border p-2 text-xs ${
                  expired ? "border-[color:var(--coral)]/40 bg-[color:var(--coral)]/10 text-[color:var(--coral)]"
                          : "border-[color:var(--amber)]/40 bg-[color:var(--amber)]/10 text-[color:var(--amber)]"
                }`}>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {expired ? "License expired — cannot dispatch" : `Expires in ${daysToExpiry} day${daysToExpiry === 1 ? "" : "s"}`}
                </div>
              )}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" /> Safety Score</span>
                  <span className="font-mono">{d.safetyScore}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${d.safetyScore}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full bg-gradient-to-r from-[color:var(--emerald)] to-[color:var(--cyan)]"
                  />
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
      <AddDriverModal open={open} onClose={() => setOpen(false)} onAdd={addDriver} />
    </div>
  );
}

function AddDriverModal({
  open, onClose, onAdd,
}: {
  open: boolean; onClose: () => void;
  onAdd: (d: { name: string; license: string; licenseCategory: string; licenseExpiry: string; contact: string; status: DriverStatus }) => void;
}) {
  const [name, setName] = useState("");
  const [license, setLicense] = useState("");
  const [licenseCategory, setLicenseCategory] = useState("Class C");
  const [licenseExpiry, setLicenseExpiry] = useState(new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10));
  const [contact, setContact] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !license.trim()) return;
    onAdd({ name: name.trim(), license: license.trim(), licenseCategory, licenseExpiry, contact: contact.trim(), status: "Available" });
    setName(""); setLicense(""); setContact(""); onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Register New Driver">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Driver Name">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="License Number">
            <input className={inputCls} value={license} onChange={(e) => setLicense(e.target.value)} placeholder="DL-12345" required />
          </Field>
          <Field label="License Category">
            <select className={inputCls} value={licenseCategory} onChange={(e) => setLicenseCategory(e.target.value)}>
              <option>Class A</option><option>Class B</option><option>Class C</option><option>CDL</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="License Expiry">
            <input type="date" className={inputCls} value={licenseExpiry} onChange={(e) => setLicenseExpiry(e.target.value)} required />
          </Field>
          <Field label="Contact Number">
            <input className={inputCls} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+1 (555) 555-0000" />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm hover:bg-white/10">Cancel</button>
          <button type="submit" className="rounded-xl bg-[color:var(--cyan)] px-4 py-2 text-sm font-semibold text-[color:var(--primary-foreground)] hover:brightness-110">
            Register Driver
          </button>
        </div>
      </form>
    </Modal>
  );
}
