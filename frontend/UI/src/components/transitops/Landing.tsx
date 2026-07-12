import { motion } from "framer-motion";
import { useState } from "react";
import { useStore, type Role } from "@/lib/store";
import { TruckScene } from "./TruckScene";
import { Field, inputCls } from "./Modal";
import { LogIn, Shield } from "lucide-react";

const roles: Role[] = ["Fleet Manager", "Dispatcher", "Driver", "Safety Officer", "Financial Analyst"];

export function Landing({ onEnter }: { onEnter: () => void }) {
  const setRole = useStore((s) => s.setRole);
  const [role, setSel] = useState<Role>("Fleet Manager");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setRole(role);
    onEnter();
  };
  return (
    <div className="min-h-screen grid-bg p-4 md:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center"
        >
          <div className="glass-strong w-full rounded-3xl p-8 neon-border">
            <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[color:var(--cyan)]">
              <Shield className="h-4 w-4" /> Secure Access Portal
            </div>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              TransitOps<span className="text-[color:var(--cyan)]">.</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Smart Transport Operations Platform · Fleet · Dispatch · Analytics
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              {[
                <Field key="e" label="Email">
                  <input type="email" className={inputCls} defaultValue="ops@transit.ai" required />
                </Field>,
                <Field key="p" label="Password">
                  <input type="password" className={inputCls} defaultValue="••••••••" required />
                </Field>,
                <Field key="r" label="Role (RBAC)">
                  <select className={inputCls} value={role} onChange={(e) => setSel(e.target.value as Role)}>
                    {roles.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </Field>,
              ].map((child, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  {child}
                </motion.div>
              ))}

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="pulse-glow flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--cyan)] px-4 py-3 text-sm font-semibold text-[color:var(--primary-foreground)]"
              >
                <LogIn className="h-4 w-4" /> Enter Command Center
              </motion.button>
              <button
                type="button"
                onClick={() => { setRole("Guest"); onEnter(); }}
                className="w-full rounded-xl px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Continue as Guest (read-only)
              </button>
            </form>
          </div>
        </motion.div>
        <div className="hidden lg:block">
          <TruckScene />
        </div>
      </div>
    </div>
  );
}
