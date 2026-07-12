import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
  hover = false,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -3, boxShadow: "0 12px 48px -12px rgba(80,200,255,0.35)" } : undefined}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
      className={cn("glass rounded-2xl p-5", className)}
      {...(rest as object)}
    >
      {children}
    </motion.div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Available: "bg-[color:var(--emerald)]/15 text-[color:var(--emerald)] border-[color:var(--emerald)]/40",
    "On Trip": "bg-[color:var(--cyan)]/15 text-[color:var(--cyan)] border-[color:var(--cyan)]/40",
    "In Shop": "bg-[color:var(--amber)]/15 text-[color:var(--amber)] border-[color:var(--amber)]/40",
    Retired: "bg-white/5 text-muted-foreground border-white/10",
    Suspended: "bg-[color:var(--coral)]/15 text-[color:var(--coral)] border-[color:var(--coral)]/40",
    "Off Duty": "bg-white/5 text-muted-foreground border-white/10",
    Cancelled: "bg-[color:var(--coral)]/15 text-[color:var(--coral)] border-[color:var(--coral)]/40",
    Active: "bg-[color:var(--cyan)]/15 text-[color:var(--cyan)] border-[color:var(--cyan)]/40",
    Completed: "bg-[color:var(--emerald)]/15 text-[color:var(--emerald)] border-[color:var(--emerald)]/40",
    Draft: "bg-muted text-muted-foreground border-border",
    Dispatched: "bg-[color:var(--amber)]/15 text-[color:var(--amber)] border-[color:var(--amber)]/40",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", map[status] ?? "bg-muted text-muted-foreground border-border")}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
