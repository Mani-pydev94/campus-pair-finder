import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Lock, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/lib/adminAuth";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/roles")({
  head: () => ({
    meta: [
      { title: "Admin — Roles & Permissions — Campus Connect AI" },
      { name: "description", content: "Read-only view of roles and their permissions." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminRolesPage,
});

type AppRole = "user" | "moderator" | "admin" | "super_admin";
const ROLE_ORDER: AppRole[] = ["user", "moderator", "admin", "super_admin"];
const ROLE_LABEL: Record<AppRole, string> = {
  user: "User",
  moderator: "Moderator",
  admin: "Admin",
  super_admin: "Super admin",
};

type PermissionRow = {
  key: string;
  description: string | null;
  category: string | null;
  roles: AppRole[];
};

function AdminRolesPage() {
  return <RolesContent />;
}

function RolesContent() {
  const admin = useAdmin();
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // The DB RLS restricts reading permissions/role_permissions to super admins.
      // Non-super-admins (plain admins) will get an empty result or a policy error,
      // which we surface gracefully rather than working around.
      const { data: perms, error: permsErr } = await supabase
        .from("permissions")
        .select("key, description, category");
      if (permsErr) {
        setError(permsErr.message);
        setLoading(false);
        return;
      }
      const { data: maps, error: mapsErr } = await supabase
        .from("role_permissions")
        .select("role, permission_id");
      if (mapsErr) {
        setError(mapsErr.message);
        setLoading(false);
        return;
      }

      const permIdToKey = new Map<string, string>();
      const permList = (perms ?? []) as { id?: string; key: string; description: string | null; category: string | null }[];
      // We need ids to map role_permissions; re-fetch with ids allowed since this is
      // the same super-admin-restricted table. Fallback: keys only.
      const enriched = await supabase
        .from("permissions")
        .select("id, key, description, category");

      const idKey = new Map<string, { key: string; description: string | null; category: string | null }>();
      for (const p of (enriched.data ?? []) as any[]) {
        idKey.set(p.id, { key: p.key, description: p.description, category: p.category });
      }

      const roleByPerm = new Map<string, AppRole[]>();
      for (const m of (maps ?? []) as { role: AppRole; permission_id: string }[]) {
        const list = roleByPerm.get(m.permission_id) ?? [];
        list.push(m.role);
        roleByPerm.set(m.permission_id, list);
      }

      const rows: PermissionRow[] = [];
      for (const [pid, meta] of idKey.entries()) {
        rows.push({
          key: meta.key,
          description: meta.description,
          category: meta.category,
          roles: (roleByPerm.get(pid) ?? []).sort(
            (a, b) => ROLE_ORDER.indexOf(a) - ROLE_ORDER.indexOf(b),
          ),
        });
      }
      rows.sort((a, b) => (a.category ?? "").localeCompare(b.category ?? "") || a.key.localeCompare(b.key));
      setPermissions(rows);
      setLoading(false);
    })();
  }, []);

  const categories = Array.from(new Set(permissions.map((p) => p.category ?? "General"))).sort();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink">Roles & Permissions</h1>
        <p className="text-sm text-subtle">
          Read-only matrix of application roles and the permissions granted to each.
        </p>
      </div>

      {!admin.isSuperAdmin && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-700">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            The permission list is restricted by the database to super admins. If no rows appear,
            the current account doesn’t have permission to read this table.
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      ) : error ? (
        <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/5 p-4 text-[14px] text-danger">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Could not load permissions: {error}</span>
        </div>
      ) : permissions.length === 0 ? (
        <p className="text-sm text-subtle">
          No permissions available to display (read access is limited to super admins).
        </p>
      ) : (
        categories.map((cat) => (
          <section key={cat} className="rounded-2xl border border-line bg-card p-5">
            <h2 className="mb-3 text-[15px] font-bold uppercase tracking-wide text-subtle">{cat}</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="text-left text-subtle">
                    <th className="py-2 pr-4 font-medium">Permission</th>
                    {ROLE_ORDER.map((r) => (
                      <th key={r} className="px-3 py-2 text-center font-medium">
                        {ROLE_LABEL[r]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissions
                    .filter((p) => (p.category ?? "General") === cat)
                    .map((p) => (
                      <tr key={p.key} className="border-t border-line/70">
                        <td className="py-2.5 pr-4">
                          <p className="font-mono text-[12px] text-ink">{p.key}</p>
                          {p.description && (
                            <p className="text-[12px] text-subtle">{p.description}</p>
                          )}
                        </td>
                        {ROLE_ORDER.map((r) => (
                          <td key={r} className="px-3 py-2.5 text-center">
                            {p.roles.includes(r) ? (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand/10 text-brand">
                                <Check className="h-3.5 w-3.5" />
                              </span>
                            ) : (
                              <span className="text-subtle/40">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
