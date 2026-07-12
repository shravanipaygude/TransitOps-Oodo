import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useStore, type Role } from "@/lib/store";
import { TruckScene } from "./TruckScene";
import { Field, inputCls } from "./Modal";
import { LogIn, Shield, UserPlus, AlertCircle } from "lucide-react";

const roles: Role[] = ["Fleet Manager", "Dispatcher", "Driver", "Safety Officer", "Financial Analyst"];

export function Landing({ onEnter }: { onEnter: () => void }) {
  const setRole = useStore((s) => s.setRole);
  const [role, setSel] = useState<Role>("Fleet Manager");
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form input states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Clear errors when toggling between sign-in and signup
  useEffect(() => {
    setAuthError(null);
  }, [isSignUp]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Pull currently registered users from LocalStorage accounts database
    const existingUsers = JSON.parse(localStorage.getItem("transitops_accounts") || "[]");

    if (isSignUp) {
      // 1. SIGN UP RULES
      const userExists = existingUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        setAuthError("An account with this email already exists.");
        return;
      }

      // Save new user profile credentials
      const newUser = { name: fullName, email: email.toLowerCase(), password, role };
      existingUsers.push(newUser);
      localStorage.setItem("transitops_accounts", JSON.stringify(existingUsers));
      
      // Log them in immediately upon account generation
      setRole(role);
      onEnter();
    } else {
      // 2. SIGN IN SECURITY VALIDATION
      // Check if user credentials perfectly match records
      const matchedUser = existingUsers.find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      // Also allow a fallback master account for your testing ease
      const isMasterAccount = email.toLowerCase() === "ops@transit.ai" && password === "123456";

      if (matchedUser) {
        setRole(matchedUser.role);
        onEnter();
      } else if (isMasterAccount) {
        setRole(role);
        onEnter();
      } else {
        setAuthError("Access Denied: Invalid email credentials or password.");
      }
    }
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
            <div className="mb-6 flex items-center gap-2 text-xs font-uppercase tracking-[0.3em] text-cyan">
              <Shield className="h-4 w-4" /> 
              {isSignUp ? "Account Registration" : "Secure Access Portal"}
            </div>

            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              TransitOps<span className="text-cyan">.</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Smart Transport Operations Platform • Fleet • Dispatch • Analytics
            </p>

            {/* Error Message Display Panel */}
            {authError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </motion.div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-4">
              {/* Full Name Field (Signup Only) */}
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Field key="name" label="Full Name">
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="e.g. Shravani Paygude"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={isSignUp}
                    />
                  </Field>
                </motion.div>
              )}

              <Field key="e" label="Email">
                <input 
                  type="email" 
                  className={inputCls} 
                  placeholder="ops@transit.ai" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </Field>

              <Field key="p" label="Password">
                <input 
                  type="password" 
                  className={inputCls} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </Field>

              <Field key="r" label="Role (RBAC)">
                <select 
                  className={inputCls} 
                  value={role} 
                  onChange={(e) => setSel(e.target.value as Role)}
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Action Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="pulse-glow flex w-full items-center justify-center gap-2 rounded-xl bg-cyan px-4 py-3 text-sm font-semibold text-primary-foreground"
              >
                {isSignUp ? (
                  <>
                    <UserPlus className="h-4 w-4" /> Create Account & Enter
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" /> Enter Command Center
                  </>
                )}
              </motion.button>

              {/* Seamless Account Option Toggle */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline decoration-cyan/40 hover:decoration-cyan"
                >
                  {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Create Account"}
                </button>
              </div>
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