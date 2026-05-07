import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Nav } from "@/components/site/Nav";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  head: () => ({ meta: [{ title: "My account · inigGO" }] }),
});

function AccountPage() {
  const { user, roles, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [agency, setAgency] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, phone, agency_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name ?? "");
          setPhone(data.phone ?? "");
          setAgency(data.agency_name ?? "");
        }
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, agency_name: agency || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-ivory text-ink">
      <Nav />
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-[11px] uppercase tracking-[0.25em] text-ink/50 mb-3">My account</p>
          <h1 className="font-display text-5xl md:text-6xl tracking-tight">
            Hello, <span className="italic text-gold">{fullName || user.email?.split("@")[0]}</span>
          </h1>
          <div className="gold-line my-8" />

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Field label="Full name" value={fullName} onChange={setFullName} />
              <Field label="Email" value={user.email ?? ""} onChange={() => {}} disabled />
              <Field label="Phone" value={phone} onChange={setPhone} />
              <Field label="Agency name (if vendor)" value={agency} onChange={setAgency} />
              <div className="flex gap-3 pt-2">
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-full bg-ink text-ivory px-6 py-3 text-[12px] uppercase tracking-[0.18em] hover:bg-gold hover:text-ink transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <button
                  onClick={async () => {
                    await signOut();
                    navigate({ to: "/" });
                  }}
                  className="rounded-full border border-ink/20 px-6 py-3 text-[12px] uppercase tracking-[0.18em] hover:border-ink transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="border border-ink/10 rounded-xl p-5">
                <p className="text-[11px] uppercase tracking-[0.2em] text-ink/50 mb-2">Membership</p>
                <p className="font-display text-xl">inigGO Member</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(roles.length ? roles : ["traveler"]).map((r) => (
                    <span key={r} className="text-[10px] uppercase tracking-[0.18em] border border-gold/40 text-gold px-2.5 py-1 rounded-full">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                to="/"
                className="block text-[12px] uppercase tracking-[0.18em] text-ink/60 hover:text-ink"
              >
                ← Back to discovery
              </Link>
            </aside>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.2em] text-ink/50">{label}</span>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-transparent border-b border-ink/20 py-2 text-base focus:outline-none focus:border-gold disabled:opacity-60"
      />
    </label>
  );
}
