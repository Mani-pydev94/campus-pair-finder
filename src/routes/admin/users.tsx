import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Search,
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  MapPin,
  X,
  Check,
  Pencil,
  Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { toast } from "sonner";
import { useAdmin } from "@/lib/adminAuth";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Admin — Users — Campus Connect AI" },
      { name: "description", content: "Browse and manage campus users." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminUsersPage,
});

/**
 * Server-side delete-user action (POST). Runs ONLY on the server.
 *
 * Security model (defense in depth, reuses EXISTING role security):
 *  - Identity comes from the bearer token attached by attachSupabaseAuth
 *    (the browser session's access token), so we never accept a caller ID
 *    at face value from the client.
 *  - Authorization re-checks has_permission('users.assign_role') server-side.
 *    That permission is seeded to super_admin ONLY — identical to how role
 *    assignment is gated — so role/permission security is unchanged.
 *  - The service-role key (supabaseAdmin) never leaves the server bundle.
 *  - A user can never delete their own Auth identity via this UI.
 *
 * Cascading deletes: every FK referencing auth.users(id) uses ON DELETE CASCADE
 * (profiles, academic_profiles, user_roles, questionnaire_responses, etc.),
 * so deleting the Auth row cleans up all dependent data automatically.
 */
const deleteUserFn = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth])
  .handler(async ({ data }) => {
    // Identify the caller from the bearer token attached by
    // attachSupabaseAuth. supabase (anon key) is sufficient to resolve the JWT
    // to a user id; the permission check below is the real gate.
    const request = getRequest();
    const authHeader = request?.headers.get("authorization");
    if (!authHeader) {
      return { ok: false as const, error: "Unauthorized: no authorization header." };
    }
    const token = authHeader.replace("Bearer ", "");
    const requesterResult = await supabase.auth.getUser(token);
    const requesterId = requesterResult.data.user?.id;
    if (!requesterId) {
      return { ok: false as const, error: "Unauthorized: could not identify caller." };
    }

    const targetUserId = (data as unknown as { targetUserId?: string })?.targetUserId;
    if (!targetUserId) {
      return { ok: false as const, error: "Invalid request: targetUserId is required." };
    }

    // Authorize: the requester must hold the literal `super_admin` role.
    // We check the role directly via the existing has_role() function (NOT the
    // `users.assign_role` permission, which only happens to be seeded to
    // super_admin). This is an explicit, single, unambiguous gate that cannot be
    // satisfied by admin/moderator/user accounts. Role/permission security
    // itself is unchanged.
    const { data: isSuper, error: roleErr } = await supabaseAdmin.rpc("has_role", {
      _user_id: requesterId,
      _role: "super_admin",
    });
    if (roleErr) {
      return { ok: false as const, error: `Authorization check failed: ${roleErr.message}` };
    }
    if (!isSuper) {
      return { ok: false as const, error: "Only a super admin can delete users." };
    }

    // Never allow self-deletion.
    if (requesterId === targetUserId) {
      return { ok: false as const, error: "You cannot delete your own account." };
    }

    // Delete the Auth user; dependent rows cascade via ON DELETE CASCADE on
    // the auth.users(id) foreign keys (profiles, academic_profiles,
    // user_roles, questionnaire_responses, etc.).
    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
    if (delErr) {
      return { ok: false as const, error: `Failed to delete user: ${delErr.message}` };
    }
    return { ok: true as const, error: null as string | null };
  });

type AppRole = "user" | "moderator" | "admin" | "super_admin";
const ALL_ROLES: AppRole[] = ["user", "moderator", "admin", "super_admin"];
const ROLE_LABEL: Record<AppRole, string> = {
  user: "User",
  moderator: "Moderator",
  admin: "Admin",
  super_admin: "Super admin",
};

type UserRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  city: string | null;
  age: number | null;
  gender: string | null;
  created_at: string;
  bio: string | null;
  university: string | null;
  degree: string | null;
  field_of_study: string | null;
  year_of_study: string | null;
  skills: string[] | null;
  interests: string[] | null;
  career_goal: string | null;
  learning_bio: string | null;
  roles: AppRole[];
};

/** Parse a comma/newline separated string into a trimmed, non-empty string[]. */
function parseList(value: string[] | null | undefined): string[] {
  if (!value) return [];
  return value.map((s) => s.trim()).filter((s) => s.length > 0);
}

function roleBadgeClass(role: AppRole) {
  switch (role) {
    case "super_admin":
      return "bg-brand/10 text-brand";
    case "admin":
      return "bg-brand/10 text-brand";
    case "moderator":
      return "bg-mint/10 text-emerald-600";
    default:
      return "bg-muted text-subtle";
  }
}

function AdminUsersPage() {
  return <UsersContent />;
}

function UsersContent() {
  const admin = useAdmin();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AppRole>("all");
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [savingRole, setSavingRole] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState<UserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const deleteUser = useServerFn(deleteUserFn);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // IMPORTANT: profiles and academic_profiles have NO foreign-key
      // relationship (both reference auth.users(id) directly, not each other).
      // Supabase/PostgREST embedded selects (`academic_profiles(...)`) REQUIRE a
      // discoverable FK — without it the WHOLE profiles query errors and returns
      // nothing. So we query the two tables separately and merge by id in JS.
      const [profilesRes, academicRes, rolesRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, display_name, avatar_url, city, age, gender, created_at")
          .order("created_at", { ascending: false })
          .limit(1000),
        supabase
          .from("academic_profiles")
          .select("id, university, degree, field_of_study, year_of_study, skills"),
        supabase.from("user_roles").select("user_id, role"),
      ]);

      const profiles = profilesRes.data;
      const academic = academicRes.data;
      const roles = rolesRes.data;

      if (profilesRes.error) {
        setLoading(false);
        toast.error(`Could not load users: ${profilesRes.error.message}`);
        return;
      }

      const academicMap = new Map<string, any>();
      for (const ap of (academic ?? []) as any[]) {
        academicMap.set(ap.id, ap);
      }

      const roleMap = new Map<string, AppRole[]>();
      for (const r of (roles ?? []) as { user_id: string; role: AppRole }[]) {
        const list = roleMap.get(r.user_id) ?? [];
        list.push(r.role);
        roleMap.set(r.user_id, list);
      }

      const merged: UserRow[] = ((profiles ?? []) as any[]).map((p) => {
        const ap = academicMap.get(p.id);
        return {
          id: p.id,
          display_name: p.display_name,
          avatar_url: p.avatar_url,
          city: p.city,
          age: p.age,
          gender: p.gender,
          created_at: p.created_at,
          bio: p.bio ?? null,
          university: ap?.university ?? null,
          degree: ap?.degree ?? null,
          field_of_study: ap?.field_of_study ?? null,
          year_of_study: ap?.year_of_study ?? null,
          skills: (ap?.skills as string[] | null) ?? null,
          interests: (ap?.interests as string[] | null) ?? null,
          career_goal: ap?.career_goal ?? null,
          learning_bio: ap?.learning_bio ?? null,
          roles: roleMap.get(p.id) ?? [],
        };
      });

      setUsers(merged);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !q ||
        (u.display_name ?? "").toLowerCase().includes(q) ||
        (u.city ?? "").toLowerCase().includes(q) ||
        (u.university ?? "").toLowerCase().includes(q) ||
        (u.field_of_study ?? "").toLowerCase().includes(q);
      const matchesRole =
        roleFilter === "all" ||
        (u.roles.length > 0 ? u.roles.includes(roleFilter) : roleFilter === "user");
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  async function assignRole(userId: string, role: AppRole) {
    // Front-end guard: only super admins may change roles. The database RLS
    // policy ("Super admins can manage roles" on user_roles) enforces this
    // server-side as well via has_permission('users.assign_role'); this guard
    // just prevents sending a doomed request and shows a clear message.
    if (!admin.isSuperAdmin) {
      toast.error("Only a super admin can assign roles.");
      return;
    }

    // Self-protection: a user (including a super admin) cannot change their
    // OWN role. This prevents privilege escalation by demoting oneself then
    // re-elevating, and prevents accidental lockout of the last privileged
    // account via the database write path.
    if (userId === admin.userId) {
      toast.error("You cannot change your own role.");
      return;
    }

    setSavingRole(true);

    // Last-super-admin protection: if the target currently holds the
    // super_admin role and we are about to assign a different role, verify that
    // at least one OTHER super_admin exists so we don't lock everyone out.
    const targetHadSuperAdmin = users.find((u) => u.id === userId)?.roles.includes("super_admin");
    if (targetHadSuperAdmin && role !== "super_admin") {
      const { count, error: countErr } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "super_admin")
        .neq("user_id", userId);
      if (countErr) {
        setSavingRole(false);
        toast.error(countErr.message);
        return;
      }
      if ((count ?? 0) === 0) {
        setSavingRole(false);
        toast.error("Cannot remove the last super admin. Assign another super admin first.");
        return;
      }
    }

    // Database RLS ("Super admins can manage roles") also enforces super_admin
    // ONLY here — the WRITE below will be rejected by the server if the caller
    // lacks users.assign_role, so this is not solely UI-enforced.
    const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (delErr) {
      setSavingRole(false);
      toast.error(delErr.message);
      return;
    }
    const { error: insErr } = await supabase.from("user_roles").insert({ user_id: userId, role });
    setSavingRole(false);
    if (insErr) {
      toast.error(insErr.message);
      return;
    }
    toast.success(`Role set to ${ROLE_LABEL[role]}`);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, roles: [role] } : u)));
    setSelected((prev) => (prev && prev.id === userId ? { ...prev, roles: [role] } : prev));
  }

  async function handleDelete(u: UserRow) {
    // Front-end guard (mirrors the server-side re-check). Only super admins may
    // delete users. Role security is unchanged.
    if (!admin.isSuperAdmin) {
      toast.error("Only a super admin can delete users.");
      return;
    }
    if (u.id === admin.userId) {
      toast.error("You cannot delete your own account.");
      return;
    }
    setDeleteTarget(u);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleting(true);
    try {
      const result = await deleteUser({ targetUserId: target.id } as any);
      if (result.ok) {
        toast.success(`Deleted ${target.display_name ?? "user"}.`);
        // Refresh the list; the server-side cascade removed the Auth row and
        // all dependent profile/role data.
        setUsers((prev) => prev.filter((u) => u.id !== target.id));
        setSelected((prev) => (prev && prev.id === target.id ? null : prev));
      } else {
        toast.error(result.error ?? "Failed to delete user.");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "An unexpected error occurred during deletion.";
      toast.error(msg);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  function openEdit(u: UserRow) {
    setProfileDraft({ ...u });
    setEditing(true);
  }

  function setField<K extends keyof UserRow>(key: K, value: UserRow[K]) {
    setProfileDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function saveProfile() {
    if (!profileDraft) return;
    // Front-end guard: only admins (who hold 'users.edit') may edit profiles.
    // The database RLS policy enforces the same server-side, so this merely
    // prevents sending a doomed request and gives a clear message.
    if (!admin.isAdmin) {
      toast.error("Only an admin can edit user profiles.");
      return;
    }
    const id = profileDraft.id;

    // Validation (req 16): age must be a sane positive integer when provided.
    const ageVal = profileDraft.age;
    if (ageVal != null && (!Number.isInteger(ageVal) || ageVal <= 0 || ageVal > 120)) {
      toast.error("Age must be a whole number between 1 and 120.");
      return;
    }

    setSavingProfile(true);
    // UPDATE profiles; RLS (users.edit) permits admins to update any row.
    const { error: pErr } = await supabase
      .from("profiles")
      .update({
        display_name: profileDraft.display_name ?? null,
        city: profileDraft.city ?? null,
        age: ageVal ?? null,
        gender: profileDraft.gender ?? null,
        bio: profileDraft.bio ?? null,
        avatar_url: profileDraft.avatar_url ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (pErr) {
      setSavingProfile(false);
      toast.error(`Could not save profile: ${pErr.message}`);
      return;
    }

    // Sync academic_profiles: pick the (potentially empty) comma-list fields
    // from the draft. We upsert by id (PK = auth.users.id); the admin INSERT
    // policy (users.edit) allows creating a missing academic row.
    const skillsList = parseList(profileDraft.skills);
    const interestsList = parseList(profileDraft.interests);
    const { error: aErr } = await supabase.from("academic_profiles").upsert(
      {
        id,
        university: profileDraft.university ?? null,
        degree: profileDraft.degree ?? null,
        field_of_study: profileDraft.field_of_study ?? null,
        year_of_study: profileDraft.year_of_study ?? null,
        skills: skillsList,
        interests: interestsList,
        career_goal: profileDraft.career_goal ?? null,
        learning_bio: profileDraft.learning_bio ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (aErr) {
      setSavingProfile(false);
      toast.error(`Could not save academic info: ${aErr.message}`);
      return;
    }

    // Refresh the row data in place so the UI shows the saved values at once.
    const updated: UserRow = {
      ...profileDraft,
      skills: skillsList,
      interests: interestsList,
    };
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    setSelected(updated);
    setProfileDraft(null);
    setEditing(false);
    setSavingProfile(false);
    toast.success("Profile updated.");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink">Users</h1>
        <p className="text-sm text-subtle">
          Browse campus users. {users.length} loaded
          {!admin.isSuperAdmin && " · role changes require a super admin."}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, city, university or field…"
            className="h-11 w-full rounded-xl border border-line bg-background pl-10 pr-4 text-[14px] text-ink outline-none focus:border-brand"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as "all" | AppRole)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="super_admin">Super admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm text-subtle">
          No users found. There may be no profiles in the database yet.
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-subtle">No users match your filters.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">User</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id} className="cursor-pointer" onClick={() => setSelected(u)}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={u.avatar_url ?? undefined} alt="" />
                        <AvatarFallback className="bg-brand/10 text-[13px] font-semibold text-brand">
                          {(u.display_name?.[0] ?? "?").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold text-ink">
                          {u.display_name ?? "Unnamed"}
                        </p>
                        <p className="truncate text-[12px] text-subtle">{u.city ?? "—"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[13px] text-subtle">
                    {u.university ?? "—"}
                    {u.field_of_study ? (
                      <span className="block truncate text-[12px]">{u.field_of_study}</span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {u.roles.length === 0 ? (
                      <Badge variant="secondary">User</Badge>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <Badge key={r} className={roleBadgeClass(r)}>
                            {ROLE_LABEL[r]}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(u);
                        }}
                        className="rounded-lg px-3 py-1.5 text-[13px] font-semibold text-brand transition-colors hover:bg-brand/10"
                      >
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(u);
                          openEdit(u);
                        }}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:bg-muted"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(u);
                        }}
                        disabled={!admin.isSuperAdmin}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-danger transition-colors hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
                        title={
                          admin.isSuperAdmin ? "Delete user" : "Only a super admin can delete users"
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={(editing ? profileDraft : selected)?.avatar_url ?? undefined}
                    alt=""
                  />
                  <AvatarFallback className="bg-brand/10 text-[14px] font-semibold text-brand">
                    {((editing ? profileDraft : selected)?.display_name?.[0] ?? "?").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0">
                  <span className="block truncate text-[16px]">
                    {(editing ? profileDraft : selected)?.display_name ?? "Unnamed"}
                  </span>
                  <span className="block text-[12px] font-normal text-subtle">
                    {selected.city ?? "No city"} · joined{" "}
                    {new Date(selected.created_at).toLocaleDateString()}
                  </span>
                </span>
              </DialogTitle>
              <DialogDescription className="sr-only">
                {editing ? "Edit user profile" : "User details and role assignment"}
              </DialogDescription>
            </DialogHeader>

            {editing && profileDraft ? (
              <EditForm
                draft={profileDraft}
                saving={savingProfile}
                canEdit={admin.isAdmin}
                onChange={setField}
                onCancel={() => {
                  setEditing(false);
                  setProfileDraft(null);
                }}
                onSave={saveProfile}
              />
            ) : (
              <>
                <div className="space-y-3 text-[14px]">
                  <DetailRow
                    icon={<GraduationCap className="h-4 w-4" />}
                    label="University"
                    value={selected.university}
                  />
                  <DetailRow
                    icon={<GraduationCap className="h-4 w-4" />}
                    label="Degree / Field"
                    value={
                      [selected.degree, selected.field_of_study].filter(Boolean).join(" — ") || null
                    }
                  />
                  {selected.year_of_study && (
                    <DetailRow
                      icon={<GraduationCap className="h-4 w-4" />}
                      label="Year"
                      value={selected.year_of_study}
                    />
                  )}
                  <DetailRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="Age / Gender"
                    value={[selected.age, selected.gender].filter(Boolean).join(" / ") || null}
                  />
                  {selected.skills && selected.skills.length > 0 && (
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-wide text-subtle">
                        Skills
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {selected.skills.map((s) => (
                          <Badge key={s} variant="outline">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.interests && selected.interests.length > 0 && (
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-wide text-subtle">
                        Interests
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {selected.interests.map((s) => (
                          <Badge key={s} variant="outline">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.career_goal && (
                    <DetailRow
                      icon={<GraduationCap className="h-4 w-4" />}
                      label="Career goal"
                      value={selected.career_goal}
                    />
                  )}
                  {selected.learning_bio && (
                    <DetailRow
                      icon={<GraduationCap className="h-4 w-4" />}
                      label="Learning bio"
                      value={selected.learning_bio}
                    />
                  )}
                  {selected.bio && (
                    <DetailRow
                      icon={<MapPin className="h-4 w-4" />}
                      label="Bio"
                      value={selected.bio}
                    />
                  )}
                </div>

                <div className="mt-2 rounded-xl border border-line bg-background p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-ink">Current roles</p>
                    <div className="flex flex-wrap gap-1">
                      {selected.roles.length === 0 ? (
                        <Badge variant="secondary">User</Badge>
                      ) : (
                        selected.roles.map((r) => (
                          <Badge key={r} className={roleBadgeClass(r)}>
                            {ROLE_LABEL[r]}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  {admin.isSuperAdmin ? (
                    <div className="mt-3">
                      <label className="text-[12px] font-semibold uppercase tracking-wide text-subtle">
                        Assign role
                      </label>
                      <Select
                        value={selected.roles[0] ?? "user"}
                        onValueChange={(v) => assignRole(selected.id, v as AppRole)}
                        disabled={savingRole}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_ROLES.map((r) => (
                            <SelectItem key={r} value={r}>
                              {ROLE_LABEL[r]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selected.id === admin.userId && (
                        <p className="mt-2 flex items-center gap-1.5 text-[12px] text-subtle">
                          <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                          You can’t remove your own super admin role.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-[12px] text-amber-700">
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        Role assignment is restricted to super admins (enforced by database policy).
                        The current account is an admin, so it can view roles but not change them.
                      </span>
                    </div>
                  )}
                </div>

                {admin.isSuperAdmin && selected.id !== admin.userId && (
                  <button
                    onClick={() => handleDelete(selected)}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-2.5 text-[13px] font-semibold text-danger transition-colors hover:bg-danger/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete user
                  </button>
                )}
              </>
            )}
          </DialogContent>
        )}
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        {deleteTarget && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Trash2 className="h-5 w-5 text-danger" />
                <span>Delete user?</span>
              </DialogTitle>
              <DialogDescription>
                This will permanently remove{" "}
                <strong>{deleteTarget.display_name ?? "this user"}</strong> from the platform. Their
                profile, academic data, roles, and all related records will be deleted
                automatically. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-lg border border-line px-4 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-muted disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 rounded-lg bg-danger px-4 py-2 text-[13px] font-semibold text-on-brand transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {deleting ? "Deleting…" : "Delete user"}
              </button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

function EditForm({
  draft,
  saving,
  canEdit,
  onChange,
  onCancel,
  onSave,
}: {
  draft: UserRow;
  saving: boolean;
  canEdit: boolean;
  onChange: <K extends keyof UserRow>(key: K, value: UserRow[K]) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const joinList = (arr: string[] | null) => (arr ?? []).join(", ");
  return (
    <div className="space-y-4 text-[14px]">
      <p className="text-[12px] text-subtle">
        Editing profile fields. Role management is not available here — it stays restricted to super
        admins.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Display name">
          <Input
            value={draft.display_name ?? ""}
            onChange={(e) => onChange("display_name", e.target.value)}
            disabled={!canEdit || saving}
          />
        </Field>
        <Field label="City">
          <Input
            value={draft.city ?? ""}
            onChange={(e) => onChange("city", e.target.value)}
            disabled={!canEdit || saving}
          />
        </Field>
        <Field label="Age">
          <Input
            type="number"
            min={1}
            max={120}
            value={draft.age ?? ""}
            onChange={(e) => onChange("age", e.target.value === "" ? null : Number(e.target.value))}
            disabled={!canEdit || saving}
          />
        </Field>
        <Field label="Gender">
          <Input
            value={draft.gender ?? ""}
            onChange={(e) => onChange("gender", e.target.value)}
            disabled={!canEdit || saving}
          />
        </Field>
        <Field label="Avatar URL">
          <Input
            value={draft.avatar_url ?? ""}
            onChange={(e) => onChange("avatar_url", e.target.value)}
            disabled={!canEdit || saving}
            placeholder="https://…"
          />
        </Field>
        <Field label="University">
          <Input
            value={draft.university ?? ""}
            onChange={(e) => onChange("university", e.target.value)}
            disabled={!canEdit || saving}
          />
        </Field>
        <Field label="Degree">
          <Input
            value={draft.degree ?? ""}
            onChange={(e) => onChange("degree", e.target.value)}
            disabled={!canEdit || saving}
          />
        </Field>
        <Field label="Field of study">
          <Input
            value={draft.field_of_study ?? ""}
            onChange={(e) => onChange("field_of_study", e.target.value)}
            disabled={!canEdit || saving}
          />
        </Field>
        <Field label="Year of study">
          <Input
            value={draft.year_of_study ?? ""}
            onChange={(e) => onChange("year_of_study", e.target.value)}
            disabled={!canEdit || saving}
          />
        </Field>
        <Field label="Career goal">
          <Input
            value={draft.career_goal ?? ""}
            onChange={(e) => onChange("career_goal", e.target.value)}
            disabled={!canEdit || saving}
          />
        </Field>
      </div>

      <Field label="Skills (comma-separated)">
        <Input
          value={joinList(draft.skills)}
          onChange={(e) => onChange("skills", e.target.value.split(","))}
          disabled={!canEdit || saving}
          placeholder="React, Python, Public speaking"
        />
      </Field>
      <Field label="Interests (comma-separated)">
        <Input
          value={joinList(draft.interests)}
          onChange={(e) => onChange("interests", e.target.value.split(","))}
          disabled={!canEdit || saving}
          placeholder="AI, Music, Hiking"
        />
      </Field>
      <Field label="Bio">
        <Textarea
          value={draft.bio ?? ""}
          onChange={(e) => onChange("bio", e.target.value)}
          disabled={!canEdit || saving}
          rows={3}
        />
      </Field>
      <Field label="Learning bio">
        <Textarea
          value={draft.learning_bio ?? ""}
          onChange={(e) => onChange("learning_bio", e.target.value)}
          disabled={!canEdit || saving}
          rows={3}
        />
      </Field>

      {!canEdit && (
        <p className="flex items-center gap-1.5 text-[12px] text-amber-700">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
          Only admins can edit profiles (enforced by database policy).
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-line px-4 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!canEdit || saving}
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-on-brand transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] font-semibold uppercase tracking-wide text-subtle">
        {label}
      </Label>
      {children}
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-subtle">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-subtle">{label}</p>
        <p className="truncate text-[14px] text-ink">{value ?? "—"}</p>
      </div>
    </div>
  );
}
