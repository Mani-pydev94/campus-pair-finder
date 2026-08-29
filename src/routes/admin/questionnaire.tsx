import { createFileRoute } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { QuestionnaireManager } from "@/components/admin/QuestionnaireManager";
import { adminDeleteQuestion } from "@/integrations/supabase/deleteQuestion.server";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { getRequest } from "@tanstack/react-start/server";

export const Route = createFileRoute("/admin/questionnaire")({
  head: () => ({
    meta: [
      { title: "Admin — Questionnaire — Campus Connect AI" },
      { name: "description", content: "Manage questionnaire categories and questions." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminQuestionnairePage,
});

/**
 * Server-side question-delete action (POST). Runs ONLY on the server.
 *
 * Security model (defense in depth, reuses EXISTING role security):
 *  - Identity comes from the bearer token attached by attachSupabaseAuth
 *    (the browser session's access token), so we never accept a caller ID at
 *    face value from the client.
 *  - Authorization re-checks has_role(auth.uid(), 'super_admin') server-side.
 *    That gate reuses the existing role architecture — no new roles or
 *    permissions are added to the database.
 *  - The service-role key (supabaseAdmin) never leaves the server bundle.
 *  - A dependency guard blocks deletion when questionnaire_responses exist for
 *    the (category, numeric question_id) pair, so user compatibility data is
 *    never broken. We never cascade-delete responses.
 */
const deleteQuestionFn = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth])
  .handler(async ({ data }) => {
    const request = getRequest();
    const authHeader = request?.headers.get("authorization");
    if (!authHeader) {
      return { ok: false as const, error: "Unauthorized: no authorization header." };
    }
    const token = authHeader.replace("Bearer ", "");
    // Resolve the JWT to a user id via the anon client; the role check below
    // is the real gate.
    const anon = (await import("@/integrations/supabase/client")).supabase;
    const requesterResult = await anon.auth.getUser(token);
    const requesterId = requesterResult.data.user?.id;
    if (!requesterId) {
      return { ok: false as const, error: "Unauthorized: could not identify caller." };
    }

    const payload = data as unknown as { questionId?: string };
    if (!payload.questionId) {
      return { ok: false as const, error: "Invalid request: questionId is required." };
    }

    return adminDeleteQuestion(requesterId, payload.questionId);
  });

function AdminQuestionnairePage() {
  const deleteQuestion = useServerFn(deleteQuestionFn);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink">Questionnaire</h1>
        <p className="text-sm text-subtle">
          Manage categories and questions shown in the compatibility questionnaire.
        </p>
      </div>
      <QuestionnaireManager deleteQuestion={deleteQuestion as unknown as (data: { questionId: string }) => Promise<{ ok: boolean; error: string | null; responseCount?: number }>} />
    </div>
  );
}
