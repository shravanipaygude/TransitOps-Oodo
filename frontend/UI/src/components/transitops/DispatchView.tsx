import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, AlertTriangle, MapPin, Truck, User, CheckCircle2, Route as RouteIcon, XCircle } from "lucide-react";
import { useStore, canManage, isLicenseExpired } from "@/lib/store";
import { GlassCard, StatusPill, SectionHeader } from "./primitives";
import { Modal, Field, inputCls } from "./Modal";

export function DispatchView() {
  const { trips, vehicles, drivers, role, dispatchTrip, completeTrip, cancelTrip } = useStore();
  const [open, setOpen] = useState(false);
  const [completeFor, setCompleteFor] = useState<string | null>(null);

  const active = trips.filter((t) => t.status === "Active");
  const past = trips.filter((t) => t.status === "Completed" || t.status === "Cancelled");
  const byV = (id: string) => vehicles.find((v) => v.id === id);
  const byD = (id: string) => drivers.find((d) => d.id === id);

  return (
    <div>
      <SectionHeader
        title="Dispatch Console"
        subtitle="Create trips · enforce capacity, license, and status rules · track lifecycle"
        action={
          canManage(role) && (
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--cyan)] px-4 py-2 text-sm font-semibold text-[color:var(--primary-foreground)] transition hover:brightness-110 pulse-glow"
            >
              <Plus className="h-4 w-4" /> Create Trip
            </button>
          )
        }
      />

      <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-[color:var(--cyan)]">Active Trips</div>
      {active.length === 0 ? (
        <GlassCard className="text-center text-sm text-muted-foreground">No active trips right now.</GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {active.map((t) => {
            const v = byV(t.vehicleId); const d = byD(t.driverId);
            return (
              <GlassCard key={t.id} hover className="relative overflow-hidden">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[color:var(--cyan)]/10 blur-3xl" />
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <RouteIcon className="h-4 w-4 text-[color:var(--cyan)]" />
                    <span className="font-semibold">{t.origin}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-semibold">{t.destination}</span>
                  </div>
                  <StatusPill status={t.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-white/5 p-3">
                    <div className="text-xs text-muted-foreground flex items-center gap-1"><Truck className="h-3 w-3" /> Vehicle</div>
                    <div className="font-semibold">{v?.name ?? "—"}</div>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <div className="text-xs text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Driver</div>
                    <div className="font-semibold">{d?.name ?? "—"}</div>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <div className="text-xs text-muted-foreground">Cargo</div>
                    <div className="font-mono">{t.cargoWeight.toLocaleString()} kg</div>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <div className="text-xs text-muted-foreground">Planned Distance</div>
                    <div className="font-mono">{t.plannedDistance} km</div>
                  </div>
                </div>
                {canManage(role) && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setCompleteFor(t.id)}
                      className="flex-1 rounded-xl bg-gradient-to-r from-[color:var(--emerald)] to-[color:var(--cyan)] px-4 py-2.5 text-sm font-semibold text-[color:var(--primary-foreground)] transition hover:brightness-110"
                    >
                      <CheckCircle2 className="mr-1 inline h-4 w-4" /> Complete
                    </button>
                    <button
                      onClick={() => cancelTrip(t.id)}
                      className="rounded-xl border border-[color:var(--coral)]/50 bg-[color:var(--coral)]/10 px-3 py-2.5 text-sm font-semibold text-[color:var(--coral)] hover:bg-[color:var(--coral)]/20"
                    >
                      <XCircle className="mr-1 inline h-4 w-4" /> Cancel
                    </button>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}

      {past.length > 0 && (
        <>
          <div className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Trip History</div>
          <div className="glass overflow-hidden rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3">Route</th><th className="p-3">Vehicle</th><th className="p-3">Driver</th>
                  <th className="p-3">Cargo</th><th className="p-3">Distance</th><th className="p-3">Fuel</th><th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {past.slice().reverse().map((t) => {
                  const v = byV(t.vehicleId); const d = byD(t.driverId);
                  const dist = (t.endOdometer ?? t.startOdometer) - t.startOdometer;
                  return (
                    <tr key={t.id} className="border-t border-white/5">
                      <td className="p-3">{t.origin} → {t.destination}</td>
                      <td className="p-3">{v?.name}</td>
                      <td className="p-3">{d?.name}</td>
                      <td className="p-3 font-mono">{t.cargoWeight} kg</td>
                      <td className="p-3 font-mono">{dist} km</td>
                      <td className="p-3 font-mono">{t.fuelConsumed ?? 0} L</td>
                      <td className="p-3"><StatusPill status={t.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <CreateTripModal open={open} onClose={() => setOpen(false)} onDispatch={dispatchTrip} />
      <CompleteTripModal
        tripId={completeFor}
        onClose={() => setCompleteFor(null)}
        onComplete={(id, odo, fuel) => { completeTrip(id, odo, fuel); setCompleteFor(null); }}
      />
    </div>
  );
}

function CreateTripModal({
  open, onClose, onDispatch,
}: {
  open: boolean; onClose: () => void;
  onDispatch: (t: { vehicleId: string; driverId: string; cargoWeight: number; origin: string; destination: string; plannedDistance: number; revenue?: number }) => { ok: boolean; error?: string };
}) {
  const { vehicles, drivers } = useStore();
  // Business rules: Retired/In Shop hidden, Suspended/expired-license hidden
  const availV = vehicles.filter((v) => v.status === "Available");
  const availD = drivers.filter((d) => d.status === "Available" && !isLicenseExpired(d));
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [weight, setWeight] = useState(500);
  const [plannedDistance, setPlannedDistance] = useState(120);
  const [revenue, setRevenue] = useState(500);
  const [origin, setOrigin] = useState("Central Hub");
  const [destination, setDestination] = useState("Harbor Depot");
  const [error, setError] = useState<string | null>(null);

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const overCapacity = vehicle ? weight > vehicle.capacity : false;
  const canDispatch = vehicleId && driverId && weight > 0 && !overCapacity;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canDispatch) return;
    const res = onDispatch({ vehicleId, driverId, cargoWeight: weight, origin, destination, plannedDistance, revenue });
    if (!res.ok) { setError(res.error ?? "Could not dispatch."); return; }
    setVehicleId(""); setDriverId(""); setWeight(500); setError(null); onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Dispatch Trip">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Origin">
            <input className={inputCls} value={origin} onChange={(e) => setOrigin(e.target.value)} />
          </Field>
          <Field label="Destination">
            <input className={inputCls} value={destination} onChange={(e) => setDestination(e.target.value)} />
          </Field>
        </div>
        <Field label={`Vehicle (${availV.length} available · Retired & In Shop excluded)`}>
          <select className={inputCls} value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required>
            <option value="">— Choose vehicle —</option>
            {availV.map((v) => (
              <option key={v.id} value={v.id}>{v.registration} · {v.name} · {v.capacity} kg</option>
            ))}
          </select>
        </Field>
        <Field label={`Driver (${availD.length} available · Suspended & expired-license excluded)`}>
          <select className={inputCls} value={driverId} onChange={(e) => setDriverId(e.target.value)} required>
            <option value="">— Choose driver —</option>
            {availD.map((d) => (
              <option key={d.id} value={d.id}>{d.name} · {d.license} ({d.licenseCategory})</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label={`Cargo (kg)${vehicle ? ` · Max ${vehicle.capacity}` : ""}`}>
            <input type="number" min={1} className={inputCls} value={weight} onChange={(e) => setWeight(+e.target.value)} />
          </Field>
          <Field label="Planned Distance (km)">
            <input type="number" min={1} className={inputCls} value={plannedDistance} onChange={(e) => setPlannedDistance(+e.target.value)} />
          </Field>
          <Field label="Trip Revenue ($)">
            <input type="number" min={0} className={inputCls} value={revenue} onChange={(e) => setRevenue(+e.target.value)} />
          </Field>
        </div>
        {vehicle && (
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              animate={{ width: `${Math.min(100, (weight / vehicle.capacity) * 100)}%` }}
              className={`h-full ${overCapacity ? "bg-[color:var(--coral)]" : "bg-gradient-to-r from-[color:var(--emerald)] to-[color:var(--cyan)]"}`}
              style={overCapacity ? { animation: "pulse-glow 1.2s ease-in-out infinite" } : undefined}
            />
          </div>
        )}
        <AnimatePresence>
          {overCapacity && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-start gap-2 rounded-xl border border-[color:var(--coral)]/50 bg-[color:var(--coral)]/10 p-3 text-sm text-[color:var(--coral)]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <div className="font-semibold">Cargo exceeds maximum capacity!</div>
                <div className="opacity-80">Reduce load or select a higher-capacity vehicle to dispatch.</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {error && (
          <div className="rounded-xl border border-[color:var(--coral)]/50 bg-[color:var(--coral)]/10 p-3 text-sm text-[color:var(--coral)]">{error}</div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm hover:bg-white/10">Cancel</button>
          <button type="submit" disabled={!canDispatch}
            className="rounded-xl bg-[color:var(--cyan)] px-4 py-2 text-sm font-semibold text-[color:var(--primary-foreground)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
            <MapPin className="mr-1 inline h-4 w-4" /> Dispatch Trip
          </button>
        </div>
      </form>
    </Modal>
  );
}

function CompleteTripModal({
  tripId, onClose, onComplete,
}: {
  tripId: string | null; onClose: () => void;
  onComplete: (id: string, odo: number, fuel: number) => void;
}) {
  const { trips, vehicles } = useStore();
  const trip = useMemo(() => trips.find((t) => t.id === tripId) ?? null, [trips, tripId]);
  const vehicle = trip ? vehicles.find((v) => v.id === trip.vehicleId) : null;
  const [odo, setOdo] = useState(0);
  const [fuel, setFuel] = useState(0);

  useEffect(() => {
    if (trip) { setOdo(trip.startOdometer + (trip.plannedDistance || 50)); setFuel(0); }
  }, [trip?.id, trip?.startOdometer, trip?.plannedDistance]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip) return;
    if (odo < trip.startOdometer) return;
    onComplete(trip.id, odo, fuel);
    setOdo(0); setFuel(0);
  };
  return (
    <Modal open={!!tripId} onClose={onClose} title="Complete Trip">
      {trip && (
        <form onSubmit={submit} className="space-y-4">
          <div className="rounded-xl bg-white/5 p-3 text-sm">
            <div className="text-muted-foreground text-xs mb-1">Route</div>
            <div className="font-semibold">{trip.origin} → {trip.destination}</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">Vehicle:</span> {vehicle?.name}</div>
              <div><span className="text-muted-foreground">Start Odo:</span> {trip.startOdometer} km</div>
            </div>
          </div>
          <Field label="Final Odometer Reading (km)">
            <input type="number" className={inputCls} min={trip.startOdometer} value={odo} onChange={(e) => setOdo(+e.target.value)} required />
          </Field>
          <Field label="Fuel Consumed (Liters)">
            <input type="number" className={inputCls} min={0} step="0.1" value={fuel} onChange={(e) => setFuel(+e.target.value)} required />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm hover:bg-white/10">Cancel</button>
            <button type="submit" className="rounded-xl bg-gradient-to-r from-[color:var(--emerald)] to-[color:var(--cyan)] px-4 py-2 text-sm font-semibold text-[color:var(--primary-foreground)] hover:brightness-110">
              Log & Close Trip
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
