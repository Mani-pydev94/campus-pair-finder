import { type ReactNode } from "react";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CalendarDays,
  ListChecks,
  Settings,
  Loader2,
  ShieldAlert,
  Home,
} from "lucide-react";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { AdminContext, useAdminGuard } from "@/lib/adminAuth";

type NavItem = {
  to: string;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  hint?: string;
  superOnly?: boolean;
};

const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
  {
    to: "/admin/roles",
    label: "Roles & Permissions",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  { to: "/admin/events", label: "Events", icon: <CalendarDays className="h-4 w-4" /> },
  {
    to: "/admin/questionnaire",
    label: "Questionnaire",
    icon: <ListChecks className="h-4 w-4" />,
    superOnly: true,
  },
  {
    to: "/admin/configuration",
    label: "Configuration",
    icon: <Settings className="h-4 w-4" />,
    disabled: true,
    hint: "Coming soon",
  },
];

function AccessDenied() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background px-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10">
        <ShieldAlert className="h-7 w-7 text-brand" />
      </span>
      <h1 className="text-[22px] font-bold tracking-[-0.01em] text-ink">Admin access required</h1>
      <p className="max-w-sm text-sm text-subtle">
        Your account doesn’t have an admin role yet. Ask an existing admin or super admin to grant
        it.
      </p>
      <Link
        to="/home"
        className="mt-2 flex h-12 w-full max-w-[220px] items-center justify-center rounded-2xl bg-gradient-to-r from-brand to-brand-light text-[15px] font-semibold text-on-brand shadow-cta transition-transform active:scale-[0.97]"
      >
        Back to Home
      </Link>
    </div>
  );
}

export function AdminLayout({ children }: { children?: ReactNode }) {
  const guard = useAdminGuard();
  const location = useLocation();

  if (guard.checking) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!guard.isAdmin) {
    return <AccessDenied />;
  }

  const initial = guard.adminName?.[0]?.toUpperCase() ?? "A";

  const content = children ?? <Outlet />;

  return (
    <AdminContext.Provider value={guard}>
      <div className="min-h-screen bg-background text-ink md:flex">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-card md:flex">
          <div className="flex h-16 items-center gap-2.5 px-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-brand to-brand-light text-on-brand shadow-cta">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-[15px] font-bold tracking-[-0.01em]">Campus Admin</p>
              <p className="text-xs text-subtle">Control centre</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {NAV.filter((item) => !item.superOnly || guard.isSuperAdmin).map((item) => {
              const active = location.pathname === item.to;
              if (item.disabled) {
                return (
                  <div
                    key={item.to}
                    className="flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-subtle/60"
                    title={item.hint}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-subtle">
                      {item.hint}
                    </span>
                  </div>
                );
              }
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand/10 text-brand"
                      : "text-subtle hover:bg-muted hover:text-ink"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-line p-3">
            <Link
              to="/home"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-subtle transition-colors hover:bg-muted hover:text-ink"
            >
              <Home className="h-4 w-4" />
              Back to app
            </Link>
          </div>
        </aside>

        {/* Mobile top nav */}
        <div className="md:hidden">
          <div className="flex items-center justify-between border-b border-line bg-card px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-brand to-brand-light text-on-brand shadow-cta">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="text-[15px] font-bold">Campus Admin</span>
            </div>
            <LogoutButton variant="ghost" className="h-9 px-3 text-sm" />
          </div>
          <nav className="no-scrollbar flex gap-2 overflow-x-auto border-b border-line bg-card px-4 py-2">
            {NAV.filter((item) => !item.superOnly || guard.isSuperAdmin).map((item) => {
              const active = location.pathname === item.to;
              if (item.disabled) {
                return (
                  <span
                    key={item.to}
                    className="flex shrink-0 cursor-not-allowed items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[13px] font-medium text-subtle/60"
                  >
                    {item.icon}
                    {item.label}
                  </span>
                );
              }
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                    active ? "bg-brand/10 text-brand" : "text-subtle hover:bg-muted"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Desktop topbar */}
          <header className="hidden h-16 items-center justify-between border-b border-line bg-card px-8 md:flex">
            <div className="text-sm text-subtle">
              Signed in as{" "}
              <span className="font-semibold text-ink">{guard.adminName ?? "Admin"}</span>{" "}
              {guard.isSuperAdmin && (
                <span className="ml-1 rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">
                  super_admin
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-brand/10 text-sm font-bold text-brand">
                {guard.adminAvatar ? (
                  <img src={guard.adminAvatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </span>
              <LogoutButton variant="outline" className="h-9 px-3 text-sm" />
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{content}</main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
