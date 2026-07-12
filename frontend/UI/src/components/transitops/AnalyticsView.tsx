import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useStore, type ExpenseKind } from "@/lib/store";
import { GlassCard, SectionHeader } from "./primitives";
import { Fuel, DollarSign, TrendingUp, Gauge, Download, Plus, Receipt } from "lucide-react";
import { Modal, Field, inputCls } from "./Modal";

export function AnalyticsView() {
  const { fuelLogs, trips, vehicles, maintenance, expenses, addExpense } = useStore();
  const [openExpense, setOpenExpense] = useState(false);

  const totals = useMemo(() => {
    const totalLiters = fuelLogs.reduce((s, l) => s + l.liters, 0);
    const totalFuelCost = fuelLogs.reduce((s, l) => s + l.cost, 0);
    const totalKm = fuelLogs.reduce((s, l) => s + l.km, 0);
    const totalMaintenance = maintenance.reduce((s, m) => s + m.cost, 0);
    const otherExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalRevenue = trips.filter((t) => t.status === "Completed").reduce((s, t) => s + (t.revenue ?? 0), 0);
    const efficiency = totalLiters > 0 ? totalKm / totalLiters : 0;
    const costPerKm = totalKm > 0 ? (totalFuelCost + totalMaintenance) / totalKm : 0;
    const completed = trips.filter((t) => t.status === "Completed").length;
    const utilization = vehicles.length
      ? Math.round((vehicles.filter((v) => v.status === "On Trip").length / vehicles.length) * 100)
      : 0;
    return { totalLiters, totalFuelCost, totalKm, totalMaintenance, otherExpenses, totalRevenue, efficiency, costPerKm, completed, utilization };
  }, [fuelLogs, trips, maintenance, expenses, vehicles]);

  const byV = (id: string) => vehicles.find((v) => v.id === id);

  const roi = useMemo(() => vehicles.map((v) => {
    const fuelForV = fuelLogs.filter((l) => l.vehicleId === v.id).reduce((s, l) => s + l.cost, 0);
    const maintForV = maintenance.filter((m) => m.vehicleId === v.id).reduce((s, m) => s + m.cost, 0);
    const revenueForV = trips.filter((t) => t.vehicleId === v.id && t.status === "Completed").reduce((s, t) => s + (t.revenue ?? 0), 0);
    const roiPct = v.acquisitionCost > 0 ? ((revenueForV - (fuelForV + maintForV)) / v.acquisitionCost) * 100 : 0;
    return { v, fuel: fuelForV, maint: maintForV, revenue: revenueForV, opCost: fuelForV + maintForV, roi: roiPct };
  }), [vehicles, fuelLogs, maintenance, trips]);

  const exportCsv = (rows: (string | number)[][], filename: string) => {
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <SectionHeader
        title="Operations Analytics"
        subtitle="Fuel efficiency · fleet utilization · operational cost · vehicle ROI"
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setOpenExpense(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[color:var(--amber)] px-3 py-2 text-xs font-semibold text-[color:var(--primary-foreground)] hover:brightness-110"
            >
              <Plus className="h-3.5 w-3.5" /> Log Expense
            </button>
            <button
              onClick={() =>
                exportCsv(
                  [["Vehicle", "Registration", "Revenue", "Fuel Cost", "Maintenance", "Operational Cost", "ROI %"],
                   ...roi.map((r) => [r.v.name, r.v.registration, r.revenue.toFixed(2), r.fuel.toFixed(2), r.maint.toFixed(2), r.opCost.toFixed(2), r.roi.toFixed(1)])],
                  "transitops-roi.csv"
                )
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          </div>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile icon={<Fuel className="h-4 w-4" />} label="Total Fuel" value={`${totals.totalLiters.toFixed(1)} L`} tint="cyan" />
        <KpiTile icon={<Gauge className="h-4 w-4" />} label="Fuel Efficiency" value={`${totals.efficiency.toFixed(2)} km/L`} tint="emerald" />
        <KpiTile icon={<DollarSign className="h-4 w-4" />} label="Operational Cost" value={`$${(totals.totalFuelCost + totals.totalMaintenance).toFixed(0)}`} tint="amber" />
        <KpiTile icon={<TrendingUp className="h-4 w-4" />} label="Fleet Utilization" value={`${totals.utilization}%`} tint="cyan" />
      </div>

      <div className="mb-6 glass overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="font-semibold">Vehicle ROI</div>
          <div className="text-xs text-muted-foreground">(Revenue − Fuel − Maintenance) ÷ Acquisition Cost</div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Vehicle</th><th className="p-3">Revenue</th><th className="p-3">Fuel</th><th className="p-3">Maint.</th><th className="p-3">Op. Cost</th><th className="p-3">ROI</th></tr>
          </thead>
          <tbody>
            {roi.map((r) => (
              <tr key={r.v.id} className="border-t border-white/5">
                <td className="p-3"><div className="font-semibold">{r.v.name}</div><div className="text-xs text-muted-foreground">{r.v.registration}</div></td>
                <td className="p-3 font-mono">${r.revenue.toFixed(0)}</td>
                <td className="p-3 font-mono">${r.fuel.toFixed(0)}</td>
                <td className="p-3 font-mono">${r.maint.toFixed(0)}</td>
                <td className="p-3 font-mono">${r.opCost.toFixed(0)}</td>
                <td className={`p-3 font-mono font-semibold ${r.roi >= 0 ? "text-[color:var(--emerald)]" : "text-[color:var(--coral)]"}`}>{r.roi.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass overflow-hidden rounded-2xl">
          <div className="border-b border-white/10 p-4 font-semibold flex items-center gap-2"><Fuel className="h-4 w-4" /> Fuel Log</div>
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-3">Date</th><th className="p-3">Vehicle</th><th className="p-3">km</th><th className="p-3">L</th><th className="p-3">Cost</th></tr>
            </thead>
            <tbody>
              {fuelLogs.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Complete trips to build the log.</td></tr>}
              {fuelLogs.slice().reverse().map((l) => (
                <motion.tr key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-white/5">
                  <td className="p-3">{l.date}</td>
                  <td className="p-3">{byV(l.vehicleId)?.name}</td>
                  <td className="p-3 font-mono">{l.km}</td>
                  <td className="p-3 font-mono">{l.liters.toFixed(1)}</td>
                  <td className="p-3 font-mono">${l.cost.toFixed(2)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass overflow-hidden rounded-2xl">
          <div className="border-b border-white/10 p-4 font-semibold flex items-center gap-2"><Receipt className="h-4 w-4" /> Other Expenses (Tolls, Fines…)</div>
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-3">Date</th><th className="p-3">Vehicle</th><th className="p-3">Kind</th><th className="p-3">Note</th><th className="p-3">Amount</th></tr>
            </thead>
            <tbody>
              {expenses.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No expenses logged yet.</td></tr>}
              {expenses.slice().reverse().map((e) => (
                <tr key={e.id} className="border-t border-white/5">
                  <td className="p-3">{e.date}</td>
                  <td className="p-3">{byV(e.vehicleId)?.name}</td>
                  <td className="p-3">{e.kind}</td>
                  <td className="p-3 text-muted-foreground">{e.note}</td>
                  <td className="p-3 font-mono">${e.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LogExpenseModal open={openExpense} onClose={() => setOpenExpense(false)} onAdd={addExpense} />
    </div>
  );
}

function KpiTile({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: string; tint: "cyan" | "amber" | "emerald" }) {
  const bg = tint === "cyan" ? "var(--cyan)" : tint === "amber" ? "var(--amber)" : "var(--emerald)";
  return (
    <GlassCard hover className="relative overflow-hidden">
      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full blur-2xl" style={{ background: `color-mix(in oklab, ${bg} 40%, transparent)` }} />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="mt-2 text-2xl font-bold font-mono">{value}</div>
    </GlassCard>
  );
}

function LogExpenseModal({
  open, onClose, onAdd,
}: {
  open: boolean; onClose: () => void;
  onAdd: (e: { vehicleId: string; kind: ExpenseKind; amount: number; note: string; date: string }) => void;
}) {
  const { vehicles } = useStore();
  const [vehicleId, setVehicleId] = useState("");
  const [kind, setKind] = useState<ExpenseKind>("Toll");
  const [amount, setAmount] = useState(20);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) return;
    onAdd({ vehicleId, kind, amount, note, date });
    setVehicleId(""); setAmount(20); setNote(""); onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Log Expense">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Vehicle">
          <select className={inputCls} value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required>
            <option value="">— Choose vehicle —</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name} · {v.registration}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Kind">
            <select className={inputCls} value={kind} onChange={(e) => setKind(e.target.value as ExpenseKind)}>
              <option>Toll</option><option>Parking</option><option>Fine</option><option>Other</option>
            </select>
          </Field>
          <Field label="Amount ($)">
            <input type="number" min={0} step="0.01" className={inputCls} value={amount} onChange={(e) => setAmount(+e.target.value)} />
          </Field>
          <Field label="Date">
            <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
        <Field label="Note">
          <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="I-880 corridor" />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm hover:bg-white/10">Cancel</button>
          <button type="submit" className="rounded-xl bg-[color:var(--amber)] px-4 py-2 text-sm font-semibold text-[color:var(--primary-foreground)] hover:brightness-110">Save Expense</button>
        </div>
      </form>
    </Modal>
  );
}
