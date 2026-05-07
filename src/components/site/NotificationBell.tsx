import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type N = { id: string; title: string; body: string | null; link: string | null; read: boolean; created_at: string };

export function NotificationBell() {
  const { user } = useAuth();
  const [items, setItems] = useState<N[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications").select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(15);
    setItems((data as N[]) ?? []);
  };

  useEffect(() => {
    if (!user) return;
    load();
    const channel = supabase
      .channel("notif-" + user.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (p) => setItems((prev) => [p.new as N, ...prev].slice(0, 15)))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line
  }, [user?.id]);

  const unread = items.filter((i) => !i.read).length;

  const markAllRead = async () => {
    if (!user || !unread) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen((o) => !o); if (!open) markAllRead(); }}
        className="relative w-9 h-9 rounded-full glass-dark flex items-center justify-center text-ivory hover:text-gold transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-gold text-ink text-[10px] font-medium flex items-center justify-center px-1">
            {unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 mt-3 w-80 max-h-[70vh] overflow-y-auto rounded-xl bg-card border border-border shadow-lg z-50"
            >
              <div className="px-4 py-3 border-b border-border">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Notifications</p>
              </div>
              {items.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground text-center">No notifications yet.</div>
              ) : (
                <ul className="divide-y divide-border">
                  {items.map((n) => {
                    const content = (
                      <div className="px-4 py-3 hover:bg-muted/40 transition-colors">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                      </div>
                    );
                    return (
                      <li key={n.id}>
                        {n.link ? <Link to={n.link} onClick={() => setOpen(false)}>{content}</Link> : content}
                      </li>
                    );
                  })}
                </ul>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
