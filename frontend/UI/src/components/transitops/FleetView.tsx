import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Truck, Search, Gauge, Shield, Hash, DollarSign, Archive, AlertCircle } from "lucide-react";
import { useStore, canManage, type VehicleType, type VehicleStatus } from "@/lib/store";
import { GlassCard, StatusPill, SectionHeader } from "./primitives";
import { Modal, Field, inputCls } from "./Modal";

export function FleetView() {
  const { vehicles, role, addVehicle, retireVehicle } = useStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | VehicleStatus>("All");
  const [typeFilter, setTypeFilter] = useState<"All" | VehicleType>("All");

  const filtered = useMemo(
    () =>
      vehicles.filter(
        (v) =>
          (statusFilter === "All" || v.status === statusFilter) &&
          (typeFilter === "All" || v.type === typeFilter) &&
          (v.name.toLowerCase().includes(q.toLowerCase()) ||
            v.registration.toLowerCase().includes(q.toLowerCase()))
      ),
    [vehicles, q, statusFilter, typeFilter]
  );

  return (
    <div>
      <SectionHeader
        title="Vehicle Registry"
        subtitle="Master fleet inventory · unique registration · live operational state"
        action={
          canManage(role) && (
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--cyan)] px-4 py-2 text-sm font-semibold text-[color:var(--primary-foreground)] transition hover:brightness-110 pulse-glow"
            >
              <Plus className="h-4 w-4" /> Add Vehicle
            </button>
          )
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or registration…"
            className={`${inputCls} pl-9`}
          />
        </div>
        <PillGroup
          options={["All", "Available", "On Trip", "In Shop", "Retired"] as const}
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as "All" | VehicleStatus)}
        />
        <PillGroup
          options={["All", "Truck", "Van", "EV"] as const}
          value={typeFilter}
          onChange={(v) => setTypeFilter(v as "All" | VehicleType)}
        />
      </div>

      <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence>
          {filtered.map((v) => (
            <motion.div
              key={v.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <GlassCard hover className="group relative overflow-hidden">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[color:var(--cyan)]/10 blur-2xl" />
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[color:var(--cyan)]/15 text-[color:var(--cyan)]">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{v.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="h-3 w-3" />{v.registration}</div>
                    </div>
                  </div>
                  <StatusPill status={v.status} />
                </div>
                <div className="space-y-2 text-sm">
                  <MetricRow label="Type · Region" value={`${v.type} · ${v.region}`} />
                  <MetricRow icon={<Gauge className="h-3.5 w-3.5" />} label="Odometer" value={`${v.odometer.toLocaleString()} km`} />
                  <MetricRow icon={<Truck className="h-3.5 w-3.5" />} label="Capacity" value={`${v.capacity.toLocaleString()} kg`} />
                  <MetricRow icon={<DollarSign className="h-3.5 w-3.5" />} label="Acquisition" value={`$${v.acquisitionCost.toLocaleString()}`} />
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" /> Safety</span>
                      <span className="font-mono">{v.safetyScore}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${v.safetyScore}%` }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-[color:var(--emerald)] to-[color:var(--cyan)]"
                      />
                    </div>
                  </div>
                </div>
                {canManage(role) && v.status !== "Retired" && v.status !== "On Trip" && (
                  <button
                    onClick={() => retireVehicle(v.id)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  >
                    <Archive className="h-3.5 w-3.5" /> Retire vehicle
                  </button>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AddVehicleModal open={open} onClose={() => setOpen(false)} onAdd={addVehicle} />
    </div>
  );
}

function MetricRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground flex items-center gap-1">{icon}{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function PillGroup<T extends string>({
  options, value, onChange,
}: { options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1 rounded-full glass p-1 text-xs">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)}
          className={`relative rounded-full px-3 py-1.5 font-medium transition ${
            value === o ? "text-[color:var(--primary-foreground)]" : "text-muted-foreground hover:text-foreground"
          }`}>
          {value === o && (
            <motion.div layoutId={`pill-${options.join(",")}`} className="absolute inset-0 rounded-full bg-[color:var(--cyan)]"
              transition={{ type: "spring", stiffness: 300, damping: 26 }} />
          )}
          <span className="relative">{o}</span>
        </button>
      ))}
    </div>
  );
}

function AddVehicleModal({
  open, onClose, onAdd,
}: {
  open: boolean; onClose: () => void;
  onAdd: (v: {
    registration: string; name: string; type: VehicleType; capacity: number;
    odometer: number; acquisitionCost: number; status: VehicleStatus;
  }) => { ok: boolean; error?: string };
}) {
  const [registration, setRegistration] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<VehicleType>("Truck");
  const [capacity, setCapacity] = useState(5000);
  const [odometer, setOdometer] = useState(0);
  const [acquisitionCost, setAcquisitionCost] = useState(40000);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !registration.trim()) return;
    const res = onAdd({ registration: registration.trim(), name: name.trim(), type, capacity, odometer, acquisitionCost, status: "Available" });
    if (!res.ok) { setError(res.error ?? "Could not add vehicle."); return; }
    setName(""); setRegistration(""); setCapacity(5000); setOdometer(0); setAcquisitionCost(40000); setType("Truck"); setError(null);
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Register New Vehicle">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Registration No. (unique)">
            <input className={inputCls} value={registration} onChange={(e) => { setRegistration(e.target.value); setError(null); }} placeholder="TX-VAN-005" required />
          </Field>
          <Field label="Vehicle Name / Model">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Van-05" required />
          </Field>
        </div>
        <Field label="Type">
          <select className={inputCls} value={type} onChange={(e) => setType(e.target.value as VehicleType)}>
            <option>Truck</option><option>Van</option><option>EV</option>
          </select>
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Capacity (kg)">
            <input type="number" min={1} className={inputCls} value={capacity} onChange={(e) => setCapacity(+e.target.value)} />
          </Field>
          <Field label="Odometer (km)">
            <input type="number" min={0} className={inputCls} value={odometer} onChange={(e) => setOdometer(+e.target.value)} />
          </Field>
          <Field label="Acquisition ($)">
            <input type="number" min={0} className={inputCls} value={acquisitionCost} onChange={(e) => setAcquisitionCost(+e.target.value)} />
          </Field>
        </div>
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-[color:var(--coral)]/50 bg-[color:var(--coral)]/10 p-3 text-sm text-[color:var(--coral)]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm hover:bg-white/10">Cancel</button>
          <button type="submit" className="rounded-xl bg-[color:var(--cyan)] px-4 py-2 text-sm font-semibold text-[color:var(--primary-foreground)] hover:brightness-110">
            Register Vehicle
          </button>
        </div>
      </form>
    </Modal>
  );
}
