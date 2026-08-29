// Server-side data loader for the explore-matches compatibility engine.
//
// WHY a .server.ts module: keeps server-only code out of the browser bundle.
// The handler itself is safe to run server-side only because it uses the
// `supabase` anon client (from client.ts) with the authenticated user's JWT,
// so RLS policies govern all data access — no service-role key required.
//
// This module exports `loadMatchDataFn`, a server function that:
//   1. Extracts the bearer token attached by attachSupabaseAuth
//   2. Creates an authenticated Supabase client (anon key + user JWT)
//   3. Fetches the current user's profile + responses
//   4. Fetches other users' profiles + responses (RLS-governed)
//   5. Fetches all active questionnaire questions + categories (dynamic)
//
// The client calls this function and then runs the pure matching engine locally.
import { createServerFn } from "@tanstack/react-start";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { supabase } from "@/integrations/supabase/client";
import { getRequest } from "@tanstack/react-start/server";
import type { Database } from "@/integrations/supabase/types";
import type {
  UserResponse,
  UserProfile,
  QuestionMeta,
} from "@/lib/matching";

type DbProfile = Database["public"]["Tables"]["profiles"]["Row"] & {
  academic_profiles: Database["public"]["Tables"]["academic_profiles"]["Row"] | null;
};

type DbResponse = Database["public"]["Tables"]["questionnaire_responses"]["Row"];

type DbQuestion = Database["public"]["Tables"]["questionnaire_questions"]["Row"];
type DbCategory = Database["public"]["Tables"]["questionnaire_categories"]["Row"];

// ── Server function ───────────────────────────────────────────────────

export const loadMatchDataFn = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth])
  .handler(async ({ context }) => {
    // Extract the bearer token attached by attachSupabaseAuth.
    // attachSupabaseAuth runs on the client and attaches the user's session
    // access_token as an Authorization header. We use that token to create an
    // authenticated anon client — the same pattern used in admin/users.tsx.
    const request = getRequest();
    const authHeader = request?.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        ok: false as const,
        error: "Authentication required",
      };
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return {
        ok: false as const,
        error: "Authentication required",
      };
    }

    // Create an authenticated client using the anon key + user's JWT.
    // This client is SUBJECT TO RLS — only data the user is permitted to read
    // will be returned. No service-role key is needed.
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);

    if (userErr || !userData.user) {
      return {
        ok: false as const,
        error: "Authentication required",
      };
    }

    const currentUserId = userData.user.id;

    try {
      // 1. Fetch the current user's profile (RLS: own profile is readable)
      const { data: currentProfile, error: profileErr } = await supabase
        .from("profiles")
        .select(`
          *,
          academic_profiles (*)
        `)
        .eq("id", currentUserId)
        .single<DbProfile>();

      if (profileErr) {
        return { ok: false as const, error: `Could not load own profile: ${profileErr.message}` };
      }

      // 2. Fetch the current user's responses (RLS: own responses are readable)
      const { data: myResponses, error: myRespErr } = await supabase
        .from("questionnaire_responses")
        .select("user_id, category, question_id, question_uuid, answer, importance")
        .eq("user_id", currentUserId);

      if (myRespErr) {
        return { ok: false as const, error: `Could not load own responses: ${myRespErr.message}` };
      }

      // 3. Fetch all OTHER users' profiles (RLS: authenticated users can view other student profiles)
      const { data: otherProfiles, error: othersErr } = await supabase
        .from("profiles")
        .select(`
          *,
          academic_profiles (*)
        `)
        .neq("id", currentUserId)
        .limit(200);

      if (othersErr) {
        return { ok: false as const, error: `Could not load candidate profiles: ${othersErr.message}` };
      }

      // 4. Fetch ALL questionnaire responses for the other users
      //    (RLS: new policy "Authenticated users can read responses for matching")
      const otherUserIds = (otherProfiles ?? []).map((p) => p.id);
      let allResponses: Array<Pick<
        DbResponse,
        "user_id" | "category" | "question_id" | "question_uuid" | "answer" | "importance"
      >> = [];

      if (otherUserIds.length > 0) {
        const { data: otherResponses, error: otherRespErr } = await supabase
          .from("questionnaire_responses")
          .select("user_id, category, question_id, question_uuid, answer, importance")
          .in("user_id", otherUserIds);

        if (otherRespErr) {
          // Non-fatal: we can still match with profile-level similarity
          console.warn("[matching-loader] Could not load other responses:", otherRespErr.message);
        } else {
          allResponses = otherResponses ?? [];
        }
      }

      // 5. Fetch all active questions + their categories (dynamic, no hardcoding)
      const { data: questions, error: questionsErr } = await supabase
        .from("questionnaire_questions")
        .select(`
          id,
          external_id,
          question_text,
          options,
          display_order,
          questionnaire_categories!inner (
            name,
            display_order
          )
        `)
        .eq("is_active", true);

      if (questionsErr) {
        console.warn("[matching-loader] Could not load questions:", questionsErr.message);
      }

      // Build question metadata map
      const questionMeta: QuestionMeta[] = [];

      for (const q of (questions ?? []) as Array<DbQuestion & {
        questionnaire_categories: DbCategory | null;
      }>) {
        const cat = q.questionnaire_categories;
        questionMeta.push({
          id: q.id,
          externalIdNum: parseInt(q.external_id.replace(/\D/g, "") || "0", 10),
          externalId: q.external_id,
          category: cat?.name ?? "General",
          categoryOrder: cat?.display_order ?? 0,
          questionText: q.question_text,
          options: Array.isArray(q.options) ? q.options.map(String) : [],
          displayOrder: q.display_order,
        });
      }

      // 6. Index responses by user_id
      const responsesByUser = new Map<string, UserResponse[]>();

      const allResp: Array<Pick<
        DbResponse,
        "user_id" | "category" | "question_id" | "question_uuid" | "answer" | "importance"
      >> = [
        ...((myResponses ?? []) as Array<Pick<
          DbResponse,
          "user_id" | "category" | "question_id" | "question_uuid" | "answer" | "importance"
        >>),
        ...(allResponses ?? []),
      ];

      for (const r of allResp) {
        const arr = responsesByUser.get(r.user_id) ?? [];
        const ur: UserResponse = {
          user_id: r.user_id,
          category: r.category,
          question_id: r.question_id,
          question_uuid: (r as any).question_uuid ?? null,
          answer: r.answer,
          importance: r.importance,
        };
        arr.push(ur);
        responsesByUser.set(r.user_id, arr);
      }

      // 7. Normalize profiles
      const normalizeProfile = (p: any): UserProfile => ({
        id: p.id,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        bio: p.bio,
        city: p.city,
        academic_profiles: p.academic_profiles
          ? {
              university: p.academic_profiles.university,
              degree: p.academic_profiles.degree,
              field_of_study: p.academic_profiles.field_of_study,
              skills: p.academic_profiles.skills,
              interests: p.academic_profiles.interests,
              year_of_study: p.academic_profiles.year_of_study,
            }
          : null,
      });

      // 8. Build candidate list
      const candidates = (otherProfiles ?? []).map((p) => ({
        userId: p.id,
        profile: normalizeProfile(p),
        responses: responsesByUser.get(p.id) ?? [],
      }));

      // 9. Build the target user data
      const targetProfile = currentProfile
        ? normalizeProfile(currentProfile)
        : {
            id: currentUserId,
            display_name: null,
            avatar_url: null,
            bio: null,
            city: null,
            academic_profiles: null,
          };

      const targetResponses = responsesByUser.get(currentUserId) ?? [];

      return {
        ok: true as const,
        targetUserId: currentUserId,
        targetProfile,
        targetResponses,
        candidates,
        questionMeta,
      };
    } catch (error) {
      console.error("[matching-loader] Unexpected error:", error);
      return {
        ok: false as const,
        error: error instanceof Error ? error.message : "Unexpected error loading match data",
      };
    }
  });

/**
 * Helper: fetch the current user's responses only (used to check if the user
 * has completed the questionnaire before showing matches).
 */
export const loadOwnResponsesFn = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth])
  .handler(async () => {
    // Extract the bearer token
    const request = getRequest();
    const authHeader = request?.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { ok: false as const, error: "Authentication required" };
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);

    if (userErr || !userData.user) {
      return { ok: false as const, error: "Authentication required" };
    }

    const userId = userData.user.id;

    // Fetch responses to count categories
    const { data: responses, error: respErr } = await supabase
      .from("questionnaire_responses")
      .select("category")
      .eq("user_id", userId);

    if (respErr) {
      return { ok: false as const, error: respErr.message };
    }

    // Count unique categories
    const categoriesCompleted = new Set((responses ?? []).map((r) => r.category)).size;

    // Count total responses
    const { count, error: countErr } = await supabase
      .from("questionnaire_responses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    return {
      ok: true as const,
      categoriesCompleted,
      totalResponses: count ?? 0,
      error: countErr?.message ?? null,
    };
  });
