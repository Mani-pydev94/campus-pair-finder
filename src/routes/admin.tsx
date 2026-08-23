import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Calendar, MapPin, Loader2, Plus, Trash2, Pencil, X, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Manage Campus Events" },
      {
        name: "description",
        content: "Admin console for Campus Connect AI: create, edit and remove upcoming campus events.",
      },
      { property: "og:title", content: "Admin — Manage Campus Events" },
      { property: "og:description", content: "Create, edit and remove upcoming campus events." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminEvents,
});

type EventRow = {
  id: string;
  name: string;
  description: string | null;
  event_at: string;
  place: string;
  gradient_from: string;
  gradient_to: string;
};

const gradients = [
  { label: "Purple", from: "from-brand", to: "to-brand-light" },
  { label: "Blue", from: "from-sky-400", to: "to-blue-600" },
  { label: "Amber", from: "from-amber-400", to: "to-orange-500" },
  { label: "Mint", from: "from-mint", to: "to-emerald-600" },
  { label: "Rose", from: "from-pink-400", to: "to-rose-500" },
];

const emptyForm = {
  name: "",
  description: "",
  event_at: "",
  place: "",
  gradient_from: "from-brand",
  gradient_to: "to-brand-light",
};

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function AdminEvents() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rows, setRows] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("id,name,description,event_at,place,gradient_from,gradient_to")
      .order("event_at", { ascending: true });
    if (error) toast.error(error.message);
    setRows((data as EventRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate({ to: "/login" });
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      const admin = Boolean(roles);
      setIsAdmin(admin);
      setChecking(false);
      if (admin) void loadEvents();
    }
    void init();
  }, [navigate, loadEvents]);

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.event_at) {
      toast.error("Event name and date are required.");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      event_at: new Date(form.event_at).toISOString(),
      place: form.place.trim(),
      gradient_from: form.gradient_from,
      gradient_to: form.gradient_to,
    };
    const { error } = editingId
      ? await supabase.from("events").update(payload).eq("id", editingId)
      : await supabase.from("events").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingId ? "Event updated" : "Event added");
    resetForm();
    void loadEvents();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Event removed");
    setRows((r) => r.filter((x) => x.id !== id));
  }

  if (checking) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-[520px] items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col items-center justify-center gap-4 bg-background px-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10">
          <ShieldAlert className="h-7 w-7 text-brand" />
        </span>
        <h1 className="text-[22px] font-bold tracking-[-0.01em] text-ink">Admin access required</h1>
        <p className="text-sm text-subtle">
          Your account doesn’t have the admin role yet. Ask an existing admin to grant it.
        </p>
        <Link
          to="/home"
          className="mt-2 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-brand to-brand-light text-[15px] font-semibold text-on-brand shadow-cta transition-transform active:scale-[0.97]"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] bg-background pb-16 pt-[max(3.25rem,calc(env(safe-area-inset-top)+2rem))]">
      <header className="flex items-center gap-3 px-6">
        <Link
          to="/home"
          aria-label="Back"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-card ring-1 ring-line transition-transform active:scale-[0.94]"
        >
          <ArrowLeft className="h-5 w-5 text-ink" />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-[26px] font-bold tracking-[-0.02em] text-ink">Admin</h1>
          <p className="text-sm text-subtle">Manage upcoming campus events</p>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mx-6 mt-6 space-y-4 rounded-[20px] border border-line/70 bg-card p-5 shadow-[0_18px_40px_-26px_rgba(18,18,18,0.4)]"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">{editingId ? "Edit event" : "New event"}</h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="flex items-center gap-1 text-[13px] font-semibold text-subtle">
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          )}
        </div>

        <label className="block">
          <span className="text-[13px] font-semibold text-subtle">Event name</span>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Hackathon 2026"
            className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-[15px] text-ink outline-none focus:border-brand"
          />
        </label>

        <label className="block">
          <span className="text-[13px] font-semibold text-subtle">Date & time</span>
          <input
            type="datetime-local"
            value={form.event_at}
            onChange={(e) => setForm({ ...form, event_at: e.target.value })}
            className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-[15px] text-ink outline-none focus:border-brand"
          />
        </label>

        <label className="block">
          <span className="text-[13px] font-semibold text-subtle">Location</span>
          <input
            value={form.place}
            onChange={(e) => setForm({ ...form, place: e.target.value })}
            placeholder="Innovation Lab"
            className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-[15px] text-ink outline-none focus:border-brand"
          />
        </label>

        <label className="block">
          <span className="text-[13px] font-semibold text-subtle">Description (optional)</span>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="mt-1.5 w-full resize-none rounded-xl border border-line bg-background px-4 py-3 text-[15px] text-ink outline-none focus:border-brand"
          />
        </label>

        <div>
          <span className="text-[13px] font-semibold text-subtle">Card colour</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {gradients.map((g) => {
              const active = form.gradient_from === g.from;
              return (
                <button
                  key={g.label}
                  type="button"
                  onClick={() => setForm({ ...form, gradient_from: g.from, gradient_to: g.to })}
                  className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[13px] font-semibold transition-transform active:scale-[0.96] ${
                    active ? "border-brand text-brand" : "border-line text-subtle"
                  }`}
                >
                  <span className={`h-4 w-4 rounded-full bg-gradient-to-br ${g.from} ${g.to}`} />
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand to-brand-light text-[15px] font-semibold text-on-brand shadow-cta transition-transform active:scale-[0.97] disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {editingId ? "Save changes" : "Add event"}
        </button>
      </form>

      <section className="mt-8 px-6">
        <h2 className="text-[22px] font-bold tracking-[-0.01em] text-ink">All events</h2>
        {loading ? (
          <div className="mt-6 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-brand" />
          </div>
        ) : rows.length === 0 ? (
          <p className="mt-4 text-sm text-subtle">No events yet. Add your first one above.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {rows.map((e) => (
              <article
                key={e.id}
                className="overflow-hidden rounded-[18px] border border-line/70 bg-card shadow-[0_14px_32px_-28px_rgba(18,18,18,0.6)]"
              >
                <div className={`h-3 bg-gradient-to-r ${e.gradient_from} ${e.gradient_to}`} />
                <div className="p-4">
                  <h3 className="truncate text-[15px] font-semibold text-ink">{e.name}</h3>
                  <p className="mt-2 flex items-center gap-1.5 text-[13px] text-subtle">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {new Date(e.event_at).toLocaleString(undefined, {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </p>
                  {e.place && (
                    <p className="mt-1 flex items-center gap-1.5 text-[13px] text-subtle">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{e.place}</span>
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(e.id);
                        setForm({
                          name: e.name,
                          description: e.description ?? "",
                          event_at: toLocalInput(e.event_at),
                          place: e.place,
                          gradient_from: e.gradient_from,
                          gradient_to: e.gradient_to,
                        });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand/10 text-[13px] font-semibold text-brand transition-transform active:scale-[0.96]"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(e.id)}
                      className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-danger/10 text-[13px] font-semibold text-danger transition-transform active:scale-[0.96]"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
