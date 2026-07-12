import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Wrench, Cog } from "lucide-react";
import { useStore, canManage } from "@/lib/store";
import { GlassCard, SectionHeader } from "./primitives";
import { Modal, Field, inputCls } from "./Modal";

const stages = ["Draft", "Dispatched", "Completed"] as const;

export function MaintenanceView() {
  const { maintenance, vehicles, role, logMaintenance, advanceMaintenance } = useStore();
  const [open, setOpen] = useState(false);
  const byV = (id: string) => vehicles.find((v) => v.id === id);
  return (
    <div>
      <SectionHeader
        title="Maintenance Pipeline"
        subtitle="Move work orders across stages · vehicles auto-flag as In Shop"
        action={
          canManage(role) && (
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--amber)] px-4 py-2 text-sm font-semibold text-[color:var(--primary-foreground)] transition hover:brightness-110"
            >
              <Plus className="h-4 w-4" /> Log Maintenance
            </button>
          )
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        {stages.map((stage) => {
          const items = maintenance.filter((m) => m.stage === stage);
          return (
            <div key={stage} className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  {stage === "Dispatched" && <Wrench className="h-4 w-4 text-[color:var(--amber)]" />}
                  {stage === "Draft" && <Cog className="h-4 w-4 text-muted-foreground" />}
                  {stage}
                </h3>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="space-y-2.5">
                {items.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-muted-foreground">
                    No orders
                  </div>
                )}
                {items.map((m) => {
                  const v = byV(m.vehicleId);
                  return (
                    <motion.div
                      key={m.id}
                      layout
                      className="glass rounded-xl p-3 text-sm"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <div className="font-semibold">{v?.name}</div>
                        {stage === "Dispatched" && (
                          <Cog className="h-4 w-4 text-[color:var(--amber)] animate-spin-slow" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{m.type} · {m.date}</div>
                      <div className="mt-1 font-mono text-xs">${m.cost.toFixed(2)}</div>
                      {canManage(role) && stage !== "Completed" && (
                        <button
                          onClick={() => advanceMaintenance(m.id)}
                          className="mt-2 w-full rounded-lg bg-white/10 px-2 py-1.5 text-xs font-medium transition hover:bg-[color:var(--cyan)] hover:text-[color:var(--primary-foreground)]"
                        >
                          Advance →
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <LogMaintenanceModal open={open} onClose={() => setOpen(false)} onLog={logMaintenance} />
    </div>
  );
}

function LogMaintenanceModal({
  open, onClose, onLog,
}: {
  open: boolean; onClose: () => void;
  onLog: (m: { vehicleId: string; type: string; date: string; cost: number }) => void;
}) {
  const { vehicles } = useStore();
  const eligible = vehicles.filter((v) => v.status !== "In Shop");
  const [vehicleId, setVehicleId] = useState("");
  const [type, setType] = useState("Oil Change");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [cost, setCost] = useState(150);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) return;
    onLog({ vehicleId, type, date, cost });
    setVehicleId(""); setType("Oil Change"); setCost(150); onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Log Maintenance">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Select Vehicle">
          <select className={inputCls} value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required>
            <option value="">— Choose vehicle —</option>
            {eligible.map((v) => <option key={v.id} value={v.id}>{v.name} · {v.status}</option>)}
          </select>
        </Field>
        <Field label="Maintenance Type">
          <select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>
            <option>Oil Change</option><option>Brake Service</option>
            <option>Tire Rotation</option><option>Battery Replacement</option>
            <option>Full Diagnostics</option><option>Engine Repair</option>
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Estimated Cost ($)">
            <input type="number" className={inputCls} value={cost} onChange={(e) => setCost(+e.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm hover:bg-white/10">Cancel</button>
          <button type="submit" className="rounded-xl bg-[color:var(--amber)] px-4 py-2 text-sm font-semibold text-[color:var(--primary-foreground)] hover:brightness-110">
            Send to Shop
          </button>
        </div>
      </form>
    </Modal>
  );
}
