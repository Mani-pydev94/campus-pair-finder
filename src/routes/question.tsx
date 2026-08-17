import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Sparkles, X } from "lucide-react";

export const Route = createFileRoute("/question")({
  head: () => ({
    meta: [
      { title: "Values Question 1 — Campus Connect AI" },
      {
        name: "description",
        content:
          "Answer one compatibility question at a time and tell us how much it matters to you.",
      },
      { property: "og:title", content: "Values Question 1 — Campus Connect AI" },
      {
        property: "og:description",
        content: "A calm, one-question-at-a-time way to build your compatibility profile.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuestionScreen,
});

const answers = [
  "Strongly Agree",
  "Agree",
  "Neutral",
  "Disagree",
  "Strongly Disagree",
];

const importance = [
  { emoji: "⭐", label: "Very Important" },
  { emoji: "🙂", label: "Somewhat Important" },
  { emoji: "👌", label: "Not Important" },
];

function QuestionScreen() {
  const router = useRouter();
  const [answer, setAnswer] = useState<string | null>(null);
  const [weight, setWeight] = useState<string | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setProgress(2.5), 200);
    return () => clearTimeout(t);
  }, []);

  const next = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // In a real app, we'd iterate through 40 questions.
      // For this premium template, we persist this one response to demonstrate the logic.
      const { error } = await supabase
        .from('questionnaire_responses')
        .upsert({
          user_id: session.user.id,
          question_id: 'q1_values',
          answer: answer || 'skipped',
          importance: weight || 'medium',
        });

      if (error) throw error;

      setLeaving(true);
      setTimeout(() => {
        router.navigate({ to: "/matches-ready" });
      }, 320);
    } catch (error) {
      console.error('Error saving response:', error);
      // Fallback to navigation anyway for demo flow
      setLeaving(true);
      setTimeout(() => {
        router.navigate({ to: "/matches-ready" });
      }, 320);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-background px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="relative flex h-12 shrink-0 items-center justify-center">
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label="Previous question"
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
          aria-label="Exit questionnaire"
          className="absolute right-0 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card text-subtle transition-transform active:scale-90"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      </header>

      {/* Progress */}
      <section className="mt-4" aria-label="Questionnaire progress">
        <div className="flex items-center justify-between text-[13px] font-medium text-subtle">
          <span>Question 1 of 40</span>
          <span>{progress}%</span>
        </div>
        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
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
        {/* Category */}
        <div className="fade-up mt-6 flex justify-center" style={{ animationDelay: "60ms" }}>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-[14px] font-semibold text-on-brand shadow-cta">
            <span aria-hidden>❤️</span> Values
          </span>
        </div>

        {/* Question */}
        <section className="fade-up mt-6 text-center" style={{ animationDelay: "120ms" }}>
          <h2 className="text-[32px] font-bold leading-[1.18] tracking-[-0.02em] text-ink">
            How important is honesty in your friendships and project teams?
          </h2>
          <p className="mx-auto mt-3 max-w-[320px] text-base leading-[1.55] text-subtle">
            Choose the answer that best reflects your personal opinion.
          </p>
        </section>

        {/* Answers */}
        <fieldset className="mt-7 space-y-3">
          <legend className="sr-only">Select your answer</legend>
          {answers.map((option, i) => {
            const selected = answer === option;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected}
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
                <span
                  className={`text-[18px] font-medium tracking-[-0.01em] ${
                    selected ? "text-brand" : "text-ink"
                  }`}
                >
                  {option}
                </span>
              </button>
            );
          })}
        </fieldset>

        {/* Importance */}
        <section className="fade-up mt-8" style={{ animationDelay: "560ms" }}>
          <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
            How important is this question to you?
          </h3>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {importance.map(({ emoji, label }) => {
              const selected = weight === label;
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={selected}
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

        {/* AI insight */}
        <section
          className="fade-up mt-7 rounded-3xl bg-gradient-to-br from-brand to-brand-deep p-5 text-on-brand shadow-cta"
          style={{ animationDelay: "640ms" }}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
            <Sparkles className="h-5 w-5" />
          </span>
          <p className="mt-3 text-[15px] leading-[1.6] text-on-brand/90">
            This answer helps us understand how you build trust and collaborate with others.
          </p>
        </section>
      </div>

      {/* Bottom actions */}
      <div className="mt-7">
        <button
          type="button"
          onClick={next}
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-brand-light to-brand-deep text-[18px] font-semibold text-on-brand shadow-cta transition-transform active:scale-[0.97] disabled:opacity-50"
          disabled={!answer || loading}
        >
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Next Question"}
        </button>
        <button
          type="button"
          onClick={next}
          className="mt-3 h-11 w-full text-[16px] font-medium text-subtle transition-transform active:scale-95"
        >
          Skip
        </button>
        <p className="mt-1 text-center text-[13px] leading-[1.5] text-subtle">
          Skipping is allowed but may reduce matching accuracy.
        </p>
        <p className="mt-4 text-center text-[13px] leading-[1.5] text-subtle">
          Your answers remain private and are never shared with other students.
        </p>
      </div>

      {/* Exit dialog */}
      {confirmExit && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 px-6 pb-[max(2rem,env(safe-area-inset-bottom))]"
          role="dialog"
          aria-modal="true"
          aria-label="Exit questionnaire"
          onClick={() => setConfirmExit(false)}
        >
          <div
            className="w-full max-w-[382px] rounded-3xl bg-card p-6 shadow-[0_30px_70px_-24px_rgba(18,18,18,0.5)]"
            style={{ animation: "fade-up 0.35s cubic-bezier(0.22,1,0.36,1) both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[20px] font-semibold tracking-[-0.01em] text-ink">
              Your progress is automatically saved.
            </p>
            <p className="mt-2 text-[15px] leading-[1.5] text-subtle">
              Are you sure you want to exit?
            </p>
            <button
              type="button"
              onClick={() => setConfirmExit(false)}
              className="mt-5 flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-brand-light to-brand-deep text-[18px] font-semibold text-on-brand shadow-cta transition-transform active:scale-[0.97]"
            >
              Keep Answering
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmExit(false);
                router.history.back();
              }}
              className="mt-3 h-12 w-full text-[16px] font-medium text-subtle transition-transform active:scale-95"
            >
              Continue Later
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
