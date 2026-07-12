import { create } from "zustand";

export type VehicleStatus = "Available" | "On Trip" | "In Shop" | "Retired";
export type DriverStatus = "Available" | "On Trip" | "Off Duty" | "Suspended";
export type VehicleType = "Truck" | "Van" | "EV";
export type TripStatus = "Draft" | "Dispatched" | "Active" | "Completed" | "Cancelled";
export type Role = "Guest" | "Driver" | "Dispatcher" | "Fleet Manager" | "Safety Officer" | "Financial Analyst";
export type ExpenseKind = "Toll" | "Parking" | "Fine" | "Other";

export interface Vehicle {
  id: string;
  registration: string; // unique
  name: string;
  type: VehicleType;
  capacity: number;
  odometer: number;
  acquisitionCost: number;
  status: VehicleStatus;
  safetyScore: number;
  region: string;
}

export interface Driver {
  id: string;
  name: string;
  license: string;
  licenseCategory: string;
  licenseExpiry: string; // YYYY-MM-DD
  contact: string;
  status: DriverStatus;
  safetyScore: number;
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number;
  origin: string;
  destination: string;
  plannedDistance: number;
  startOdometer: number;
  endOdometer?: number;
  fuelConsumed?: number;
  revenue?: number;
  status: TripStatus;
  startedAt: number;
  completedAt?: number;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  type: string;
  date: string;
  stage: "Draft" | "Dispatched" | "Completed";
  cost: number;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  tripId?: string;
  liters: number;
  cost: number;
  km: number;
  date: string;
}

export interface Expense {
  id: string;
  vehicleId: string;
  kind: ExpenseKind;
  amount: number;
  note: string;
  date: string;
}

export const isLicenseExpired = (d: Driver) => new Date(d.licenseExpiry) < new Date();

export const canManage = (r: Role) => r === "Dispatcher" || r === "Fleet Manager";

interface State {
  role: Role;
  theme: "dark" | "light";
  authed: boolean;
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenance: MaintenanceLog[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  setRole: (r: Role) => void;
  setAuthed: (v: boolean) => void;
  toggleTheme: () => void;
  addVehicle: (v: Omit<Vehicle, "id" | "safetyScore" | "region"> & Partial<Pick<Vehicle, "safetyScore" | "region">>) => { ok: boolean; error?: string };
  retireVehicle: (id: string) => void;
  addDriver: (d: Omit<Driver, "id" | "safetyScore"> & Partial<Pick<Driver, "safetyScore">>) => void;
  dispatchTrip: (t: { vehicleId: string; driverId: string; cargoWeight: number; origin: string; destination: string; plannedDistance: number; revenue?: number }) => { ok: boolean; error?: string };
  completeTrip: (tripId: string, endOdometer: number, fuelConsumed: number) => void;
  cancelTrip: (tripId: string) => void;
  logMaintenance: (m: { vehicleId: string; type: string; date: string; cost: number }) => void;
  advanceMaintenance: (id: string) => void;
  addExpense: (e: Omit<Expense, "id">) => void;
}

const uid = () => Math.random().toString(36).slice(2, 9);
const futureDate = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

const seedVehicles: Vehicle[] = [
  { id: uid(), registration: "TX-AUR-001", name: "Aurora-01", type: "Truck", capacity: 12000, odometer: 84210, acquisitionCost: 68000, status: "Available", safetyScore: 92, region: "North" },
  { id: uid(), registration: "TX-NOV-002", name: "Nova-02", type: "Van", capacity: 1800, odometer: 21540, acquisitionCost: 32000, status: "On Trip", safetyScore: 88, region: "East" },
  { id: uid(), registration: "TX-VLT-003", name: "Volt-03", type: "EV", capacity: 900, odometer: 5320, acquisitionCost: 45000, status: "Available", safetyScore: 96, region: "South" },
  { id: uid(), registration: "TX-ORI-004", name: "Orion-04", type: "Truck", capacity: 15000, odometer: 132400, acquisitionCost: 82000, status: "In Shop", safetyScore: 81, region: "West" },
  { id: uid(), registration: "TX-ZEP-005", name: "Zephyr-05", type: "Van", capacity: 2200, odometer: 44210, acquisitionCost: 29500, status: "Available", safetyScore: 90, region: "North" },
];

const seedDrivers: Driver[] = [
  { id: uid(), name: "Alex Rivera",   license: "DL-88213", licenseCategory: "Class C", licenseExpiry: futureDate(320), contact: "+1 (415) 555-0142", status: "Available", safetyScore: 94 },
  { id: uid(), name: "Priya Shah",    license: "DL-77104", licenseCategory: "Class B", licenseExpiry: futureDate(180), contact: "+1 (415) 555-0177", status: "On Trip", safetyScore: 91 },
  { id: uid(), name: "Kenji Tanaka",  license: "DL-66091", licenseCategory: "Class A", licenseExpiry: futureDate(22), contact: "+1 (415) 555-0208", status: "Available", safetyScore: 89 },
  { id: uid(), name: "Sofia Marín",   license: "DL-55028", licenseCategory: "Class C", licenseExpiry: futureDate(410), contact: "+1 (415) 555-0311", status: "Available", safetyScore: 96 },
];

const seedTrip: Trip = {
  id: uid(),
  vehicleId: seedVehicles[1].id,
  driverId: seedDrivers[1].id,
  cargoWeight: 1200,
  origin: "Central Hub",
  destination: "Harbor Depot",
  plannedDistance: 240,
  startOdometer: seedVehicles[1].odometer,
  revenue: 850,
  status: "Active",
  startedAt: Date.now() - 1000 * 60 * 42,
};

export const useStore = create<State>((set, get) => ({
  role: "Guest",
  theme: "dark",
  authed: true,
  vehicles: seedVehicles,
  drivers: seedDrivers,
  trips: [seedTrip],
  maintenance: [
    { id: uid(), vehicleId: seedVehicles[3].id, type: "Full Diagnostics", date: new Date().toISOString().slice(0, 10), stage: "Dispatched", cost: 420 },
  ],
  fuelLogs: [
    { id: uid(), vehicleId: seedVehicles[0].id, liters: 60, cost: 84, km: 420, date: new Date().toISOString().slice(0, 10) },
    { id: uid(), vehicleId: seedVehicles[2].id, liters: 0, cost: 12, km: 180, date: new Date().toISOString().slice(0, 10) },
  ],
  expenses: [
    { id: uid(), vehicleId: seedVehicles[0].id, kind: "Toll", amount: 24, note: "I-880 corridor", date: new Date().toISOString().slice(0, 10) },
  ],
  setRole: (r) => set({ role: r }),
  setAuthed: (v) => set({ authed: v }),
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === "dark" ? "light" : "dark";
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("light", next === "light");
      }
      return { theme: next };
    }),
  addVehicle: (v) => {
    const state = get();
    const reg = v.registration.trim().toUpperCase();
    if (!reg) return { ok: false, error: "Registration number is required." };
    if (state.vehicles.some((x) => x.registration.toUpperCase() === reg)) {
      return { ok: false, error: "Registration number must be unique." };
    }
    set({
      vehicles: [
        ...state.vehicles,
        { id: uid(), safetyScore: 90, region: "North", ...v, registration: reg },
      ],
    });
    return { ok: true };
  },
  retireVehicle: (id) =>
    set((s) => ({ vehicles: s.vehicles.map((v) => (v.id === id ? { ...v, status: "Retired" } : v)) })),
  addDriver: (d) =>
    set((s) => ({
      drivers: [...s.drivers, { id: uid(), safetyScore: 90, ...d }],
    })),
  dispatchTrip: ({ vehicleId, driverId, cargoWeight, origin, destination, plannedDistance, revenue }) => {
    const state = get();
    const vehicle = state.vehicles.find((v) => v.id === vehicleId);
    const driver = state.drivers.find((d) => d.id === driverId);
    if (!vehicle) return { ok: false, error: "Vehicle not found." };
    if (!driver) return { ok: false, error: "Driver not found." };
    if (vehicle.status !== "Available") return { ok: false, error: `Vehicle is ${vehicle.status}.` };
    if (driver.status !== "Available") return { ok: false, error: `Driver is ${driver.status}.` };
    if (isLicenseExpired(driver)) return { ok: false, error: "Driver license is expired." };
    if (cargoWeight > vehicle.capacity) return { ok: false, error: "Cargo exceeds vehicle capacity." };
    const trip: Trip = {
      id: uid(),
      vehicleId, driverId, cargoWeight, origin, destination,
      plannedDistance,
      revenue,
      startOdometer: vehicle.odometer,
      status: "Active",
      startedAt: Date.now(),
    };
    set({
      trips: [...state.trips, trip],
      vehicles: state.vehicles.map((v) => (v.id === vehicleId ? { ...v, status: "On Trip" } : v)),
      drivers: state.drivers.map((d) => (d.id === driverId ? { ...d, status: "On Trip" } : d)),
    });
    return { ok: true };
  },
  completeTrip: (tripId, endOdometer, fuelConsumed) => {
    const state = get();
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip) return;
    const distance = Math.max(0, endOdometer - trip.startOdometer);
    const cost = fuelConsumed * 1.4 + distance * 0.12;
    set({
      trips: state.trips.map((t) =>
        t.id === tripId ? { ...t, status: "Completed", endOdometer, fuelConsumed, completedAt: Date.now() } : t
      ),
      vehicles: state.vehicles.map((v) =>
        v.id === trip.vehicleId ? { ...v, status: "Available", odometer: endOdometer } : v
      ),
      drivers: state.drivers.map((d) => (d.id === trip.driverId ? { ...d, status: "Available" } : d)),
      fuelLogs: [
        ...state.fuelLogs,
        {
          id: uid(), vehicleId: trip.vehicleId, tripId,
          liters: fuelConsumed,
          cost: Math.round(cost * 100) / 100,
          km: distance,
          date: new Date().toISOString().slice(0, 10),
        },
      ],
    });
  },
  cancelTrip: (tripId) =>
    set((s) => {
      const trip = s.trips.find((t) => t.id === tripId);
      if (!trip) return s;
      return {
        trips: s.trips.map((t) => (t.id === tripId ? { ...t, status: "Cancelled" } : t)),
        vehicles: s.vehicles.map((v) => (v.id === trip.vehicleId ? { ...v, status: "Available" } : v)),
        drivers: s.drivers.map((d) => (d.id === trip.driverId ? { ...d, status: "Available" } : d)),
      };
    }),
  logMaintenance: ({ vehicleId, type, date, cost }) =>
    set((s) => ({
      maintenance: [
        ...s.maintenance,
        { id: uid(), vehicleId, type, date, stage: "Dispatched", cost },
      ],
      vehicles: s.vehicles.map((v) => (v.id === vehicleId ? { ...v, status: "In Shop" } : v)),
    })),
  advanceMaintenance: (id) =>
    set((s) => {
      const item = s.maintenance.find((m) => m.id === id);
      if (!item) return s;
      const next = item.stage === "Draft" ? "Dispatched" : item.stage === "Dispatched" ? "Completed" : "Completed";
      return {
        maintenance: s.maintenance.map((m) => (m.id === id ? { ...m, stage: next } : m)),
        vehicles:
          next === "Completed"
            ? s.vehicles.map((v) => (v.id === item.vehicleId && v.status !== "Retired" ? { ...v, status: "Available" } : v))
            : s.vehicles,
      };
    }),
  addExpense: (e) => set((s) => ({ expenses: [...s.expenses, { ...e, id: uid() }] })),
}));
