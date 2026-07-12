import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, Truck, Users, MapPin, Wrench, LineChart,
  Moon, Sun, ChevronDown, Zap,
} from "lucide-react";
import { useStore, type Role } from "@/lib/store";
import { Landing } from "./Landing";
import { DashboardView } from "./DashboardView";
import { FleetView } from "./FleetView";
import { DriversView } from "./DriversView";
import { DispatchView } from "./DispatchView";
import { MaintenanceView } from "./MaintenanceView";
import { AnalyticsView } from "./AnalyticsView";

type Tab = "dashboard" | "fleet" | "drivers" | "dispatch" | "maintenance" | "analytics";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "fleet", label: "Fleet", icon: <Truck className="h-4 w-4" /> },
  { id: "drivers", label: "Drivers", icon: <Users className="h-4 w-4" /> },
  { id: "dispatch", label: "Dispatch", icon: <MapPin className="h-4 w-4" /> },
  { id: "maintenance", label: "Maintenance", icon: <Wrench className="h-4 w-4" /> },
  { id: "analytics", label: "Analytics", icon: <LineChart className="h-4 w-4" /> },
];

const roleOptions: Role[] = ["Guest", "Driver", "Dispatcher", "Fleet Manager", "Safety Officer", "Financial Analyst"];

export function TransitOpsApp() {
  const { role, setRole, theme, toggleTheme } = useStore();
  const [entered, setEntered] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  if (!entered) return <Landing onEnter={() => setEntered(true)} />;

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-10 grid-bg opacity-40" />
      <header className="sticky top-0 z-40 border-b border-white/10 glass-strong">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-2 shrink-0">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[color:var(--cyan)] text-[color:var(--primary-foreground)] pulse-glow">
              <Zap className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold leading-none">TransitOps</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Command Center</div>
            </div>
          </div>

          <nav className="ml-3 hidden flex-1 items-center gap-1 md:flex">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  tab === t.id ? "text-[color:var(--primary-foreground)]" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === t.id && (
                  <motion.div layoutId="active-tab" className="absolute inset-0 rounded-xl bg-[color:var(--cyan)]"
                    transition={{ type: "spring", stiffness: 300, damping: 26 }} />
                )}
                <span className="relative flex items-center gap-1.5">{t.icon}{t.label}</span>
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium hover:bg-white/10"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--emerald)]" />
                {role}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl glass-strong p-1 neon-border"
                  >
                    {roleOptions.map((r) => (
                      <button
                        key={r}
                        onClick={() => { setRole(r); setMenuOpen(false); }}
                        className={`block w-full rounded-lg px-3 py-2 text-left text-xs transition ${
                          r === role ? "bg-[color:var(--cyan)] text-[color:var(--primary-foreground)] font-semibold" : "hover:bg-white/10"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-white/10"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto border-t border-white/10 px-3 py-2 md:hidden">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium ${
                tab === t.id ? "bg-[color:var(--cyan)] text-[color:var(--primary-foreground)]" : "text-muted-foreground"
              }`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {tab === "dashboard" && <DashboardView />}
            {tab === "fleet" && <FleetView />}
            {tab === "drivers" && <DriversView />}
            {tab === "dispatch" && <DispatchView />}
            {tab === "maintenance" && <MaintenanceView />}
            {tab === "analytics" && <AnalyticsView />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
