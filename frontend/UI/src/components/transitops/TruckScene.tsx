import { motion } from "framer-motion";

export function TruckScene() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl glass grid-bg">
      <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--cyan)]/10 via-transparent to-[color:var(--primary)]/20" />
      <svg viewBox="0 0 600 500" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="road" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--cyan)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
          </linearGradient>
          <filter id="softGlow"><feGaussianBlur stdDeviation="4" /></filter>
        </defs>
        {/* horizon */}
        <line x1="0" y1="320" x2="600" y2="320" stroke="url(#road)" strokeWidth="2" />
        <line x1="0" y1="360" x2="600" y2="360" stroke="url(#road)" strokeWidth="1" strokeOpacity="0.4" />
        {/* road lines */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={i * 100} y="340" width="60" height="3" fill="var(--cyan)" opacity="0.5">
            <animate attributeName="x" from={i * 100} to={i * 100 - 100} dur="1.2s" repeatCount="indefinite" />
          </rect>
        ))}
      </svg>

      <motion.div
        initial={{ x: 500, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 60, damping: 14 }}
        className="absolute left-1/2 top-[52%] -translate-x-1/2"
      >
        <svg width="320" height="180" viewBox="0 0 320 180">
          {/* trailer */}
          <rect x="20" y="40" width="180" height="80" rx="6" fill="oklch(0.28 0.04 260)" stroke="var(--cyan)" strokeOpacity="0.6" />
          <rect x="30" y="50" width="160" height="60" rx="4" fill="none" stroke="var(--cyan)" strokeOpacity="0.3" strokeDasharray="4 4" />
          {/* cab */}
          <path d="M200 55 L260 55 L285 90 L285 120 L200 120 Z" fill="oklch(0.32 0.06 250)" stroke="var(--cyan)" />
          <rect x="215" y="65" width="55" height="25" rx="3" fill="oklch(0.82 0.17 210)" opacity="0.5" />
          {/* headlight */}
          <motion.circle
            cx="285" cy="105" r="6" fill="var(--amber)"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          <motion.ellipse
            cx="310" cy="105" rx="30" ry="8" fill="var(--amber)"
            filter="url(#softGlow)"
            animate={{ opacity: [0.2, 0.55, 0.2] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          {/* wheels */}
          {[60, 130, 240].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy="130" r="14" fill="oklch(0.15 0 0)" stroke="var(--cyan)" />
              <motion.g animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: `${cx}px 130px` }}>
                <line x1={cx - 10} y1="130" x2={cx + 10} y2="130" stroke="var(--cyan)" strokeWidth="1.5" />
                <line x1={cx} y1="120" x2={cx} y2="140" stroke="var(--cyan)" strokeWidth="1.5" />
              </motion.g>
            </g>
          ))}
        </svg>
      </motion.div>

      <div className="absolute left-6 top-6 space-y-2">
        <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--cyan)]">TransitOps</div>
        <div className="text-2xl font-bold">Fleet Command · Online</div>
        <div className="text-sm text-muted-foreground max-w-xs">
          Neural dispatch grid synchronized. All corridors nominal.
        </div>
      </div>

      <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-3 text-xs">
        {[
          { l: "Corridors", v: "12" },
          { l: "Latency", v: "24ms" },
          { l: "Uptime", v: "99.98%" },
        ].map((s) => (
          <div key={s.l} className="glass-strong rounded-xl p-3">
            <div className="text-muted-foreground">{s.l}</div>
            <div className="font-mono text-lg text-[color:var(--cyan)]">{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
