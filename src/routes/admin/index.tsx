import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users,
  ShieldCheck,
  CalendarDays,
  UserCog,
  Loader2,
  ArrowRight,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Campus Connect AI" },
      { name: "description", content: "Admin control centre for Campus Connect AI." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

type RoleCount = { role: string; count: number };
type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  city: string | null;
  created_at: string;
};
type EventRow = { id: string; name: string; event_at: string; place: string | null };

function AdminDashboard() {
  return <DashboardContent />;
}

function DashboardContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    moderators: 0,
    superAdmins: 0,
    events: 0,
  });
  const [recentUsers, setRecentUsers] = useState<ProfileRow[]>([]);
  const [recentEvents, setRecentEvents] = useState<EventRow[]>([]);

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    const [
      profilesRes,
      rolesRes,
      eventsCountRes,
      recentUsersRes,
      recentEventsRes,
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("user_roles").select("role"),
      // Total events count.
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id, display_name, avatar_url, city, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      // Upcoming events only, sorted by date asc.
      supabase
        .from("events")
        .select("id, name, event_at, place")
        .gte("event_at", new Date().toISOString())
        .order("event_at", { ascending: true })
        .limit(5),
    ]);

    // Surface any query error gracefully.
    const firstErr =
      profilesRes.error ?? rolesRes.error ?? eventsCountRes.error ??
      recentUsersRes.error ?? recentEventsRes.error;
    if (firstErr) {
      setError(firstErr.message);
      setLoading(false);
      return;
    }

    const roleRows = (rolesRes.data ?? []) as RoleCount[];
    const byRole: Record<string, number> = {};
    for (const r of roleRows) byRole[r.role] = (byRole[r.role] ?? 0) + 1;

    setStats({
      totalUsers: profilesRes.count ?? 0,
      admins: byRole["admin"] ?? 0,
      moderators: byRole["moderator"] ?? 0,
      superAdmins: byRole["super_admin"] ?? 0,
      events: eventsCountRes.count ?? 0,
    });
    setRecentUsers((recentUsersRes.data ?? []) as ProfileRow[]);
    setRecentEvents((recentEventsRes.data ?? []) as EventRow[]);
    setLoading(false);
  }

  // Re-fetch when the user navigates back to the dashboard (e.g. from
  // /admin/users or /admin/events) so the numbers reflect the latest database
  // state after a create/update/delete elsewhere.
  const location = useLocation();

  useEffect(() => {
    loadDashboard();
    // Re-fetch whenever the pathname changes (e.g. navigating back to /admin).
  }, [location.pathname]);

  const activeAdmins = stats.admins + stats.superAdmins + stats.moderators;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink">Dashboard</h1>
        <p className="text-sm text-subtle">Overview of your campus community.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      ) : error ? (
        <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/5 p-4 text-[14px] text-danger">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Could not load dashboard data: {error}</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard
              icon={<Users className="h-5 w-5" />}
              label="Total users"
              value={stats.totalUsers}
            />
            <StatCard
              icon={<ShieldCheck className="h-5 w-5" />}
              label="Staff (admin + mod)"
              value={activeAdmins}
            />
            <StatCard
              icon={<UserCog className="h-5 w-5" />}
              label="Super admins"
              value={stats.superAdmins}
            />
            <StatCard
              icon={<ShieldCheck className="h-5 w-5" />}
              label="Admins"
              value={stats.admins}
            />
            <StatCard
              icon={<UserCog className="h-5 w-5" />}
              label="Moderators"
              value={stats.moderators}
            />
            <StatCard
              icon={<CalendarDays className="h-5 w-5" />}
              label="Events"
              value={stats.events}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-line bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-[17px] font-bold text-ink">
                  <Users className="h-4 w-4 text-brand" /> Recent users
                </h2>
                <Link
                  to="/admin/users"
                  className="flex items-center gap-1 text-[13px] font-semibold text-brand"
                >
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {recentUsers.length === 0 ? (
                <p className="text-sm text-subtle">No users yet.</p>
              ) : (
                <ul className="space-y-1">
                  {recentUsers.map((u) => (
                    <li
                      key={u.id}
                      className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={u.avatar_url ?? undefined} alt="" />
                        <AvatarFallback className="bg-brand/10 text-[13px] font-semibold text-brand">
                          {(u.display_name?.[0] ?? "?").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-ink">
                          {u.display_name ?? "Unnamed"}
                        </p>
                        <p className="truncate text-[12px] text-subtle">
                          {u.city ?? "No city"} · joined{" "}
                          {new Date(u.created_at).toLocaleDateString(undefined, {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-line bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-[17px] font-bold text-ink">
                  <CalendarDays className="h-4 w-4 text-brand" /> Upcoming events
                </h2>
                <Link
                  to="/admin/events"
                  className="flex items-center gap-1 text-[13px] font-semibold text-brand"
                >
                  Manage <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {recentEvents.length === 0 ? (
                <p className="text-sm text-subtle">No events scheduled.</p>
              ) : (
                <ul className="space-y-1">
                  {recentEvents.map((ev) => (
                    <li
                      key={ev.id}
                      className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <Clock className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-ink">{ev.name}</p>
                        <p className="truncate text-[12px] text-subtle">
                          {new Date(ev.event_at).toLocaleString(undefined, {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {ev.place ? ` · ${ev.place}` : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="rounded-2xl border border-line bg-card p-5">
            <h2 className="text-[17px] font-bold text-ink">Quick actions</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <QuickAction
                to="/admin/users"
                icon={<Users className="h-4 w-4" />}
                label="Manage users"
              />
              <QuickAction
                to="/admin/roles"
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Roles & permissions"
              />
              <QuickAction
                to="/admin/events"
                icon={<CalendarDays className="h-4 w-4" />}
                label="Manage events"
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
        {icon}
      </span>
      <p className="mt-3 text-[28px] font-bold tracking-[-0.02em] text-ink">{value}</p>
      <p className="text-[13px] text-subtle">{label}</p>
    </div>
  );
}

function QuickAction({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-xl border border-line px-4 py-3 text-[14px] font-semibold text-ink transition-colors hover:border-brand hover:bg-brand/5"
    >
      <span className="flex items-center gap-2.5">
        <span className="text-brand">{icon}</span>
        {label}
      </span>
      <ArrowRight className="h-4 w-4 text-subtle" />
    </Link>
  );
}
