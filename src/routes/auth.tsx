import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in · inigGO" },
      { name: "description", content: "Access your inigGO account to book luxury stays and curated experiences." },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/account" });
  }, [user, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/account" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/account`,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/account" });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 py-24 bg-ink text-ivory">
      <div
        className="absolute inset-0 opacity-30 bg-center bg-cover"
        style={{ backgroundImage: `url(${heroImg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/70 to-ink" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md glass-dark rounded-2xl p-8 md:p-10"
      >
        <Link to="/" className="font-display text-2xl tracking-tight">
          inig<span className="text-gold">GO</span>
        </Link>
        <h1 className="font-display text-3xl mt-6 mb-1">
          {mode === "signin" ? "Welcome back" : "Begin your journey"}
        </h1>
        <p className="text-ivory/60 text-sm mb-8">
          {mode === "signin" ? "Sign in to access curated escapes." : "Create an account in seconds."}
        </p>

        <button
          onClick={onGoogle}
          disabled={busy}
          className="w-full rounded-full bg-ivory text-ink py-3 text-[13px] uppercase tracking-[0.18em] hover:bg-gold transition-colors disabled:opacity-50"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-6 text-[11px] uppercase tracking-[0.2em] text-ivory/40">
          <div className="h-px flex-1 bg-ivory/15" /> or <div className="h-px flex-1 bg-ivory/15" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-transparent border border-ivory/20 rounded-md px-4 py-3 text-sm placeholder:text-ivory/40 focus:outline-none focus:border-gold"
            />
          )}
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border border-ivory/20 rounded-md px-4 py-3 text-sm placeholder:text-ivory/40 focus:outline-none focus:border-gold"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border border-ivory/20 rounded-md px-4 py-3 text-sm placeholder:text-ivory/40 focus:outline-none focus:border-gold"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full border border-gold text-gold py-3 text-[13px] uppercase tracking-[0.18em] hover:bg-gold hover:text-ink transition-colors disabled:opacity-50"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-[12px] text-ivory/60">
          {mode === "signin" ? "New to inigGO?" : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-gold hover:underline"
          >
            {mode === "signin" ? "Create account" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
