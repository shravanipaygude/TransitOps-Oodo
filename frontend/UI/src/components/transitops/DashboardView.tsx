import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Truck, Wrench, Users, Route as RouteIcon, Gauge, Clock } from "lucide-react";
import { useStore, type VehicleStatus, type VehicleType } from "@/lib/store";
import { GlassCard, SectionHeader, StatusPill } from "./primitives";
import { LiveMap } from "./LiveMap";

export function DashboardView() {
  const { vehicles, drivers, trips } = useStore();
  const [typeFilter, setTypeFilter] = useState<"All" | VehicleType>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | VehicleStatus>("All");
  const [regionFilter, setRegionFilter] = useState<string>("All");

  const regions = useMemo(() => ["All", ...Array.from(new Set(vehicles.map((v) => v.region)))], [vehicles]);

  const filtered = useMemo(() => vehicles.filter((v) =>
    (typeFilter === "All" || v.type === typeFilter) &&
    (statusFilter === "All" || v.status === statusFilter) &&
    (regionFilter === "All" || v.region === regionFilter)
  ), [vehicles, typeFilter, statusFilter, regionFilter]);

  const active = filtered.filter((v) => v.status === "On Trip");
  const available = filtered.filter((v) => v.status === "Available");
  const inShop = filtered.filter((v) => v.status === "In Shop");
  const onDuty = drivers.filter((d) => d.status === "On Trip");
  const activeTrips = trips.filter((t) => t.status === "Active");
  const pendingTrips = trips.filter((t) => t.status === "Draft");
  const utilization = filtered.length ? Math.round((active.length / filtered.length) * 100) : 0;

  const kpis = [
    { icon: <Activity className="h-4 w-4" />, label: "Active Vehicles", value: active.length, tint: "cyan" },
    { icon: <Truck className="h-4 w-4" />, label: "Available", value: available.length, tint: "emerald" },
    { icon: <Wrench className="h-4 w-4" />, label: "In Maintenance", value: inShop.length, tint: "amber" },
    { icon: <RouteIcon className="h-4 w-4" />, label: "Active Trips", value: activeTrips.length, tint: "cyan" },
    { icon: <Clock className="h-4 w-4" />, label: "Pending Trips", value: pendingTrips.length, tint: "amber" },
    { icon: <Users className="h-4 w-4" />, label: "Drivers On Duty", value: onDuty.length, tint: "cyan" },
  ] as const;

  return (
    <div>
      <SectionHeader title="Fleet Control Dashboard" subtitle="Real-time operational overview" />

      <div className="mb-5 flex flex-wrap gap-2 text-xs">
        <FilterGroup label="Type" options={["All", "Truck", "Van", "EV"]} value={typeFilter} onChange={(v) => setTypeFilter(v as "All" | VehicleType)} />
        <FilterGroup label="Status" options={["All", "Available", "On Trip", "In Shop", "Retired"]} value={statusFilter} onChange={(v) => setStatusFilter(v as "All" | VehicleStatus)} />
        <FilterGroup label="Region" options={regions} value={regionFilter} onChange={setRegionFilter} />
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <GlassCard key={k.label} hover className="relative overflow-hidden">
            <div
              className="absolute -right-4 -top-4 h-16 w-16 rounded-full blur-2xl"
              style={{ background: `color-mix(in oklab, var(--${k.tint}) 40%, transparent)` }}
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">{k.icon}{k.label}</div>
            <motion.div key={k.value} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="mt-2 text-3xl font-bold font-mono">{k.value}</motion.div>
          </GlassCard>
        ))}
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard className="relative flex items-center justify-between overflow-hidden">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Gauge className="h-4 w-4" /> Utilization</div>
            <div className="mt-1 text-2xl font-bold font-mono">{utilization}%</div>
          </div>
          <UtilizationRing value={utilization} />
        </GlassCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LiveMap activeVehicles={active.map((v) => ({ id: v.id, name: v.name }))} />
        </div>
        <GlassCard>
          <div className="mb-3 font-semibold">Fleet Status</div>
          <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
            {filtered.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      v.status === "Available" ? "bg-[color:var(--emerald)]"
                      : v.status === "On Trip" ? "bg-[color:var(--cyan)]"
                      : v.status === "In Shop" ? "bg-[color:var(--amber)]"
                      : "bg-white/30"
                    }`}
                  />
                  <span className="truncate font-medium">{v.name}</span>
                  <span className="text-xs text-muted-foreground">{v.type} · {v.region}</span>
                </div>
                <StatusPill status={v.status} />
              </div>
            ))}
            {filtered.length === 0 && <div className="text-center text-xs text-muted-foreground p-6">No vehicles match these filters.</div>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function FilterGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-full glass p-1">
      <span className="px-2 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)}
          className={`rounded-full px-2.5 py-1 font-medium transition ${
            value === o ? "bg-[color:var(--cyan)] text-[color:var(--primary-foreground)]" : "text-muted-foreground hover:text-foreground"
          }`}>{o}</button>
      ))}
    </div>
  );
}

function UtilizationRing({ value }: { value: number }) {
  const r = 26; const c = 2 * Math.PI * r;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} stroke="var(--border)" strokeWidth="6" fill="none" />
      <motion.circle cx="36" cy="36" r={r} stroke="var(--cyan)" strokeWidth="6" fill="none"
        strokeLinecap="round" strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (c * value) / 100 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ transform: "rotate(-90deg)", transformOrigin: "36px 36px" }} />
    </svg>
  );
}
