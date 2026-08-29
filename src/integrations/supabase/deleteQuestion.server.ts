// SERVER-ONLY module. Do NOT import this from client-bundle code.
//
// Why a .server.ts module: the browser bundle must never see the service-role
// key. This file is tree-shaken out of the client by TanStack Start/Vite's
// `.server` convention.
//
// What this module does: deletes a single questionnaire_question row, but ONLY
// after verifying two things server-side (defense in depth — the UI also gates
// on isSuperAdmin, but the client must never be trusted):
//
//   1. Authorization: the caller holds the `super_admin` role. We reuse the
//      EXISTING security-definer helper `has_role(auth.uid(), 'super_admin')`
//      — no new roles or permissions are introduced, and RLS/role security is
//      unchanged.
//
//   2. Dependency guard: the question is NOT deleted if any
//      `questionnaire_responses` reference it. Those responses are kept — we
//      never cascade-delete them. (Existing 40 questions + any question with
//      live responses stay intact; only orphan questions can be physically
//      removed. Inactive-but-referenced questions should be Deactivated instead.)
//
// The response lookup matches on (category name, numeric question_id). This
// mirrors exactly how src/routes/question.tsx saves responses
// (upsert({ category, question_id: numericIdFromExternalId })). We use the
// service-role client for the count because the anon/RLS client only returns a
// user's OWN responses, which would under-report a shared question's usage.
import { supabaseAdmin } from "./client.server";

export type DeleteQuestionResult = {
  ok: boolean;
  error: string | null;
  /** Number of questionnaire_responses referencing this question (if checked). */
  responseCount?: number;
};

/** Numeric suffix of an external_id, e.g. "v1" -> 1, "p12" -> 12. */
function numericIdFromExternalId(externalId: string): number {
  const digits = externalId.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

export async function adminDeleteQuestion(
  requesterId: string,
  questionId: string,
): Promise<DeleteQuestionResult> {
  // 1) Authorize: requester must be a super admin (existing role security).
  const { data: isSuper, error: roleErr } = await supabaseAdmin.rpc("has_role", {
    _user_id: requesterId,
    _role: "super_admin",
  });
  if (roleErr) {
    return { ok: false, error: `Authorization check failed: ${roleErr.message}` };
  }
  if (!isSuper) {
    return { ok: false, error: "Only a super admin can delete questions." };
  }

  // 2) Resolve the question row to derive the numeric question_id that the
  //    normal questionnaire app stores in questionnaire_responses. We look the
  //    row up by its UUID `id` (the value the admin UI already holds), so the
  //    delete is precise and cannot be confused by external_id reuse. The
  //    category name is resolved from the question's own category_id (never
  //    trusted from the client) for the response-dependency match below.
  const { data: q, error: qErr } = await supabaseAdmin
    .from("questionnaire_questions")
    .select("id, external_id, category_id")
    .eq("id", questionId)
    .maybeSingle();
  if (qErr) {
    return { ok: false, error: `Could not load question: ${qErr.message}` };
  }
  if (!q) {
    return { ok: false, error: "Question not found." };
  }

  const { data: cat, error: catErr } = await supabaseAdmin
    .from("questionnaire_categories")
    .select("name")
    .eq("id", q.category_id)
    .maybeSingle();
  if (catErr) {
    return { ok: false, error: `Could not load category: ${catErr.message}` };
  }
  const categoryName = cat?.name;
  if (!categoryName) {
    return { ok: false, error: "Question's category no longer exists." };
  }
  const numericQuestionId = numericIdFromExternalId(q.external_id);

  // 3) Dependency guard: count responses for this (category, question_id) pair.
  //    questionnaire_responses.question_id is text; the app stores the numeric
  //    suffix of the external_id (e.g. "v1" -> "1").
  const { count, error: countErr } = await supabaseAdmin
    .from("questionnaire_responses")
    .select("id", { count: "exact", head: true })
    .eq("category", categoryName)
    .eq("question_id", String(numericQuestionId));

  if (countErr) {
    return { ok: false, error: `Could not check dependencies: ${countErr.message}` };
  }

  const responseCount = count ?? 0;
  if (responseCount > 0) {
    return {
      ok: false,
      error:
        `This question has ${responseCount} saved response(s). Deleting it would break user compatibility data. ` +
        `Deactivate it instead, or delete those responses first.`,
      responseCount,
    };
  }

  // 4) Delete the single question row by UUID. No cascade — responses (if any
  //    existed) would be left in place. There is no FK from responses to the
  //    question UUID, so no cascade trigger fires.
  const { error: delErr } = await supabaseAdmin
    .from("questionnaire_questions")
    .delete()
    .eq("id", questionId);

  if (delErr) {
    return { ok: false, error: `Failed to delete question: ${delErr.message}` };
  }

  return { ok: true, error: null, responseCount: 0 };
}
