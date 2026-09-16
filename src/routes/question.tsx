import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, Check, Sparkles, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

type Question = {
  id: string;
  uuid?: string; // questionnaire_questions.id (UUID) — used for question_uuid on responses
  text: string;
  description?: string;
  aiInsight: string;
  icon: string;
};

// Database question type matching questionnaire_questions table
type DbQuestion = {
  id: string; // UUID
  external_id: string; // v1, p1, c1, etc.
  question_text: string;
  description: string | null;
  question_type: string;
  options: Json | null;
  ai_insight: string | null;
  emoji: string | null;
  display_order: number;
};

export const Route = createFileRoute("/question")({
  validateSearch: (search: Record<string, unknown>): { category: string | undefined } => {
    return {
      category: (search['category'] as string) || 'Values',
    };
  },
  component: QuestionScreen,
});

const importanceOptions = [
  { emoji: "⭐", label: "Very Important" },
  { emoji: "🙂", label: "Somewhat Important" },
  { emoji: "👌", label: "Not Important" },
];

function QuestionScreen() {
  const router = useRouter();
  const search = Route.useSearch();
  const category = (search as any).category || 'Values';

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [weight, setWeight] = useState<string | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [dbQuestions, setDbQuestions] = useState<DbQuestion[]>([]);

  // Fetch questions for the selected category from database
  useEffect(() => {
    let mounted = true;
    async function fetchQuestions() {
      setQuestionsLoading(true);
      setQuestionsError(null);

      // First get the category ID
      const { data: categoryData, error: catError } = await supabase
        .from('questionnaire_categories')
        .select('id')
        .eq('name', category)
        .eq('is_active', true)
        .single();

      if (catError || !categoryData) {
        if (mounted) {
          setQuestionsError('Category not found');
          setQuestionsLoading(false);
        }
        return;
      }

      // Then fetch questions for that category
      const { data: questionsData, error: qError } = await supabase
        .from('questionnaire_questions')
        .select('id, external_id, question_text, description, question_type, options, ai_insight, emoji, display_order')
        .eq('category_id', categoryData.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (mounted) {
        if (qError) {
          setQuestionsError(qError.message);
        } else {
          setDbQuestions(questionsData || []);
        }
        setQuestionsLoading(false);
      }
    }

    fetchQuestions();
    return () => { mounted = false; };
  }, [category]);

  // Convert DB questions to UI Question format
  const categoryQuestions = useMemo(() => {
    return dbQuestions.map(q => ({
      id: q.external_id, // Use external_id (v1, p1, etc.) as the id for compatibility
      uuid: q.id, // Also store the UUID for the matching engine
      text: q.question_text,
      description: q.description ?? undefined,
      aiInsight: q.ai_insight ?? '',
      icon: q.emoji ?? '❓',
    })) as Question[];
  }, [dbQuestions]);

  const currentQuestion = useMemo(() => {
    return (categoryQuestions[currentQuestionIndex] || categoryQuestions[0]) as Question;
  }, [categoryQuestions, currentQuestionIndex]);

  // Answer options for the current question. Prefer the options stored on the
  // question row (so admins can manage them dynamically); fall back to the
  // original fixed scale for legacy compatibility.
  const answers = useMemo(() => {
    const opts = currentQuestion
      ? (dbQuestions.find((q) => q.external_id === currentQuestion.id)?.options as
          | unknown[]
          | null
          | undefined)
      : null;
    if (Array.isArray(opts) && opts.length > 0) {
      return opts.map((o) => String(o));
    }
    return [
      "Strongly Agree",
      "Agree",
      "Neutral",
      "Disagree",
      "Strongly Disagree",
    ];
  }, [currentQuestion, dbQuestions]);

  useEffect(() => {
    if (categoryQuestions && categoryQuestions.length > 0) {
      const totalQuestions = categoryQuestions.length;
      const currentProgress = Math.round(((currentQuestionIndex) / totalQuestions) * 100);
      setProgress(currentProgress);
    }
  }, [currentQuestionIndex, categoryQuestions]);

  const next = async () => {
    if (!currentQuestion) return;

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to save progress");
        return;
      }

      const numericIdStr = currentQuestion.id.replace(/\D/g, '') || '0';
      const numericId = parseInt(numericIdStr);

      const { error } = await supabase
        .from('questionnaire_responses')
        .upsert({
          user_id: session.user.id,
          question_id: numericId as any,
          question_uuid: (currentQuestion as any).uuid ?? null,
          category: category,
          answer: answer || 'skipped',
          importance: weight || 'Somewhat Important',
        });

      if (error) throw error;

      if (categoryQuestions && currentQuestionIndex < categoryQuestions.length - 1) {
        setAnswer(null);
        setWeight(null);
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setLeaving(true);
        setTimeout(() => {
          router.navigate({ to: "/questionnaire-hub" });
        }, 320);
      }
    } catch (error) {
      console.error('Error saving response:', error);
      if (categoryQuestions && currentQuestionIndex < categoryQuestions.length - 1) {
        setAnswer(null);
        setWeight(null);
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        router.navigate({ to: "/questionnaire-hub" });
      }
    } finally {
      setLoading(false);
    }
  };

  if (questionsLoading) {
    return (
      <main className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-background px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
        <header className="relative flex h-12 shrink-0 items-center justify-center">
          <button
            type="button"
            onClick={() => router.history.back()}
            className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full text-ink transition-transform active:scale-90"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
            Compatibility Profile
          </h1>
        </header>
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      </main>
    );
  }

  if (questionsError) {
    return (
      <main className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-background px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
        <header className="relative flex h-12 shrink-0 items-center justify-center">
          <button
            type="button"
            onClick={() => router.history.back()}
            className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full text-ink transition-transform active:scale-90"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
            Compatibility Profile
          </h1>
        </header>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/5 p-4 text-[14px] text-danger">
            <X className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Could not load questions: {questionsError}</span>
          </div>
        </div>
      </main>
    );
  }

  if (!currentQuestion || !categoryQuestions || categoryQuestions.length === 0) return null;

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-background px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="relative flex h-12 shrink-0 items-center justify-center">
        <button
          type="button"
          onClick={() => router.history.back()}
          className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full text-ink transition-transform active:scale-90"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
          Compatibility Profile
        </h1>
        <button
          type="button"
          onClick={() => setConfirmExit(true)}
          className="absolute right-0 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card text-subtle transition-transform active:scale-90"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      </header>

      <section className="mt-4">
        <div className="flex items-center justify-between text-[13px] font-medium text-subtle">
          <span>Question {currentQuestionIndex + 1} of {categoryQuestions.length}</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-light to-brand-deep"
            style={{
              width: `${progress}%`,
              transition: "width 1s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        </div>
      </section>

      <div
        className="flex flex-1 flex-col"
        style={{
          transition: "transform 0.32s cubic-bezier(0.22,1,0.36,1), opacity 0.32s ease",
          transform: leaving ? "translateX(-24px)" : "none",
          opacity: leaving ? 0 : 1,
        }}
      >
        <div className="fade-up mt-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-[14px] font-semibold text-on-brand shadow-cta">
            <span aria-hidden>{currentQuestion.icon}</span> {category}
          </span>
        </div>

        <section className="fade-up mt-6 text-center">
          <h2 className="text-[28px] font-bold leading-[1.18] tracking-[-0.02em] text-ink min-h-[100px] flex items-center justify-center">
            {currentQuestion.text}
          </h2>
          <p className="mx-auto mt-3 max-w-[320px] text-base leading-[1.55] text-subtle">
            Choose the answer that best reflects your personal opinion.
          </p>
        </section>

        <fieldset className="mt-7 space-y-3">
          {answers.map((option, i) => {
            const selected = answer === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setAnswer(option)}
                className={`fade-up flex h-16 w-full items-center gap-4 rounded-[18px] border px-5 text-left transition-all active:scale-[0.98] ${
                  selected
                    ? "scale-[1.015] border-brand bg-brand/8 shadow-[0_20px_40px_-24px_rgba(109,94,247,0.7)]"
                    : "border-line bg-card shadow-[0_14px_34px_-30px_rgba(18,18,18,0.5)]"
                }`}
                style={{ animationDelay: `${180 + i * 70}ms` }}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    selected ? "border-brand bg-brand" : "border-line bg-card"
                  }`}
                >
                  {selected && <Check className="h-3.5 w-3.5 text-on-brand" />}
                </span>
                <span className={`text-[18px] font-medium tracking-[-0.01em] ${selected ? "text-brand" : "text-ink"}`}>
                  {option}
                </span>
              </button>
            );
          })}
        </fieldset>

        <section className="fade-up mt-8">
          <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
            How important is this question to you?
          </h3>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {importanceOptions.map(({ emoji, label }) => {
              const selected = weight === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setWeight(label)}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[14px] font-semibold transition-all active:scale-95 ${
                    selected
                      ? "border-brand bg-brand text-on-brand shadow-cta"
                      : "border-line bg-card text-subtle"
                  }`}
                >
                  <span aria-hidden>{emoji}</span>
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="fade-up mt-7 rounded-3xl bg-gradient-to-br from-brand to-brand-deep p-5 text-on-brand shadow-cta">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
            <Sparkles className="h-5 w-5" />
          </span>
          <p className="mt-3 text-[15px] leading-[1.6] text-on-brand/90">
            {currentQuestion.aiInsight}
          </p>
        </section>
      </div>

      <div className="mt-7">
        <button
          type="button"
          onClick={next}
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-brand-light to-brand-deep text-[18px] font-semibold text-on-brand shadow-cta transition-transform active:scale-[0.97] disabled:opacity-50"
          disabled={!answer || loading}
        >
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : currentQuestionIndex < (categoryQuestions?.length || 0) - 1 ? "Next Question" : "Finish Section"}
        </button>
        <button
          type="button"
          onClick={next}
          className="mt-3 h-11 w-full text-[16px] font-medium text-subtle transition-transform active:scale-95"
        >
          Skip
        </button>
      </div>

      {confirmExit && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 px-6 pb-[max(2rem,env(safe-area-inset-bottom))]"
          onClick={() => setConfirmExit(false)}
        >
          <div
            className="w-full max-w-[382px] rounded-3xl bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[20px] font-semibold text-ink">Your progress is automatically saved.</p>
            <p className="mt-2 text-[15px] text-subtle">Are you sure you want to exit?</p>
            <button
              onClick={() => setConfirmExit(false)}
              className="mt-5 flex h-14 w-full items-center justify-center rounded-2xl bg-brand text-white font-semibold shadow-cta"
            >
              Keep Answering
            </button>
            <button
              onClick={() => {
                setConfirmExit(false);
                router.history.back();
              }}
              className="mt-3 h-12 w-full text-[16px] font-medium text-subtle"
            >
              Continue Later
            </button>
          </div>
        </div>
      )}
    </main>
  );
}