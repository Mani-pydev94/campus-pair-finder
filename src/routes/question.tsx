import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, Check, Sparkles, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Question = {
  id: string;
  text: string;
  description?: string;
  aiInsight: string;
  icon: string;
};

const questionnaireData: Record<string, Question[]> = {
  "Values": [
    { 
      id: "v1", 
      text: "How important is honesty in your friendships and project teams?", 
      aiInsight: "This answer helps us understand how you build trust and collaborate with others.",
      icon: "❤️"
    },
    { 
      id: "v2", 
      text: "Do you believe in strict adherence to deadlines over project quality?", 
      aiInsight: "We match you with people who share your standards for excellence and timing.",
      icon: "❤️"
    },
    {
      id: "v3",
      text: "How much do you value personal growth compared to academic success?",
      aiInsight: "Helps us find partners who prioritize self-improvement as much as you do.",
      icon: "❤️"
    },
    {
      id: "v4",
      text: "Do you prefer working with people who share your political views?",
      aiInsight: "Aligns your social environment with your core belief systems.",
      icon: "❤️"
    },
    {
      id: "v5",
      text: "Is social responsibility a major factor in your career choices?",
      aiInsight: "Matches you with purpose-driven individuals who want to make an impact.",
      icon: "❤️"
    },
    {
      id: "v6",
      text: "How important is family and tradition in your daily life decisions?",
      aiInsight: "Connects you with others who share similar cultural or familial priorities.",
      icon: "❤️"
    }
  ],
  "Personality": [
    { 
      id: "p1", 
      text: "Do you feel energized after spending time with a large group of people?", 
      aiInsight: "Helps us balance team dynamics between introverts and extroverts.",
      icon: "🧠"
    },
    {
      id: "p2",
      text: "Do you tend to follow a strict schedule rather than being spontaneous?",
      aiInsight: "Finds partners who match your organizational style and pace.",
      icon: "🧠"
    },
    {
      id: "p3",
      text: "Do you consider yourself a creative thinker more than a logical one?",
      aiInsight: "Balances teams with a mix of innovative and analytical minds.",
      icon: "🧠"
    },
    {
      id: "p4",
      text: "How do you handle high-pressure situations or tight deadlines?",
      aiInsight: "Ensures your study group can remain calm and productive under stress.",
      icon: "🧠"
    },
    {
      id: "p5",
      text: "Are you more focused on the big picture than the small details?",
      aiInsight: "Pairs detail-oriented students with visionary thinkers.",
      icon: "🧠"
    },
    {
      id: "p6",
      text: "Do you enjoy being the center of attention in social settings?",
      aiInsight: "Refines your social compatibility with different personality types.",
      icon: "🧠"
    },
    {
      id: "p7",
      text: "Do you often rely on your intuition when making important decisions?",
      aiInsight: "Connects you with others who trust their gut feelings similarly.",
      icon: "🧠"
    },
    {
      id: "p8",
      text: "Are you easily affected by the emotions of those around you?",
      aiInsight: "Matches you with empathetic or steady partners based on your needs.",
      icon: "🧠"
    }
  ],
  "Communication": [
    { 
      id: "c1", 
      text: "Do you prefer written updates over verbal meetings for project progress?", 
      aiInsight: "Aligns your team with your preferred collaboration channels.",
      icon: "💬"
    },
    {
      id: "c2",
      text: "How comfortable are you with giving direct, critical feedback?",
      aiInsight: "Matches you with people who share your communication transparency.",
      icon: "💬"
    },
    {
      id: "c3",
      text: "Do you prefer to resolve conflicts immediately as they arise?",
      aiInsight: "Ensures your group has a healthy approach to disagreement resolution.",
      icon: "💬"
    },
    {
      id: "c4",
      text: "Are you a frequent user of emojis and informal language in professional chats?",
      aiInsight: "Synchronizes your digital communication style with others.",
      icon: "💬"
    },
    {
      id: "c5",
      text: "Do you prefer one-on-one deep conversations over group discussions?",
      aiInsight: "Finds the best setting for you to voice your ideas effectively.",
      icon: "💬"
    },
    {
      id: "c6",
      text: "How often do you check your messages during a typical study session?",
      aiInsight: "Aligns response time expectations within your match group.",
      icon: "💬"
    }
  ],
  "Learning Style": [
    { 
      id: "l1", 
      text: "Do you learn better by doing (hands-on) than by reading theory?", 
      aiInsight: "Finds study partners who process information like you do.",
      icon: "📚"
    },
    {
      id: "l2",
      text: "Do you prefer visual aids like charts and diagrams over text?",
      aiInsight: "Matches your learning preferences for better collaborative studying.",
      icon: "📚"
    },
    {
      id: "l3",
      text: "Do you find it easier to remember information that you hear?",
      aiInsight: "Identifies if you benefit from auditory learning or discussions.",
      icon: "📚"
    },
    {
      id: "l4",
      text: "Do you like to study in complete silence without any distractions?",
      aiInsight: "Connects you with partners who respect your need for a quiet space.",
      icon: "📚"
    },
    {
      id: "l5",
      text: "Do you enjoy teaching others what you have just learned?",
      aiInsight: "Finds partners who benefit from the 'protégé effect' with you.",
      icon: "📚"
    }
  ],
  "Career Goals": [
    { 
      id: "g1", 
      text: "Are you more interested in joining a large corporation than starting your own business?", 
      aiInsight: "Connects you with others moving in the same career direction.",
      icon: "🎯"
    },
    {
      id: "g2",
      text: "Is financial stability your primary motivation for your career choice?",
      aiInsight: "Aligns your professional drive with like-minded individuals.",
      icon: "🎯"
    },
    {
      id: "g3",
      text: "Do you plan to pursue further studies (Master's, PhD) after graduation?",
      aiInsight: "Finds long-term academic partners who share your educational path.",
      icon: "🎯"
    },
    {
      id: "g4",
      text: "How important is work-life balance in your future career plans?",
      aiInsight: "Matches you with others who share your professional lifestyle values.",
      icon: "🎯"
    },
    {
      id: "g5",
      text: "Are you interested in working in a different country in the future?",
      aiInsight: "Connects you with global-minded students and potential travelers.",
      icon: "🎯"
    }
  ],
  "Lifestyle": [
    { 
      id: "s1", 
      text: "Are you a morning person who prefers to study before 9 AM?", 
      aiInsight: "Finds partners who are active during your peak productivity hours.",
      icon: "🌍"
    },
    {
      id: "s2",
      text: "Do you lead an active lifestyle with regular exercise and sports?",
      aiInsight: "Matches you with students who balance health and academics.",
      icon: "🌍"
    },
    {
      id: "s3",
      text: "How much time do you spend on social media on a daily basis?",
      aiInsight: "Helps manage distractions within your potential study group.",
      icon: "🌍"
    },
    {
      id: "s4",
      text: "Do you prefer to keep your study space strictly organized?",
      aiInsight: "Ensures physical or digital workspace compatibility with partners.",
      icon: "🌍"
    },
    {
      id: "s5",
      text: "Do you enjoy traveling and exploring new cultures and cuisines?",
      aiInsight: "Connects you through shared lifestyle interests and curiosity.",
      icon: "🌍"
    }
  ],
  "Interests & Hobbies": [
    { 
      id: "h1", 
      text: "Do you enjoy participating in competitive hackathons?", 
      aiInsight: "Matches you based on shared passions and hobbies.",
      icon: "🎨"
    },
    {
      id: "h2",
      text: "Are you interested in video games or competitive e-sports?",
      aiInsight: "Finds community through shared gaming and digital entertainment.",
      icon: "🎨"
    },
    {
      id: "h3",
      text: "Do you enjoy reading fiction or non-fiction books in your free time?",
      aiInsight: "Connects you with fellow book lovers and intellectual peers.",
      icon: "🎨"
    },
    {
      id: "h4",
      text: "Are you a fan of attending live music concerts or festivals?",
      aiInsight: "Matches your social energy and taste in entertainment.",
      icon: "🎨"
    },
    {
      id: "h5",
      text: "Do you enjoy outdoor activities like hiking, camping, or cycling?",
      aiInsight: "Finds adventure-minded partners for off-campus activities.",
      icon: "🎨"
    }
  ]
};

export const Route = createFileRoute("/question")({
  validateSearch: (search: Record<string, unknown>): { category: string | undefined } => {
    return {
      category: (search['category'] as string) || 'Values',
    };
  },
  component: QuestionScreen,
});

const answers = [
  "Strongly Agree",
  "Agree",
  "Neutral",
  "Disagree",
  "Strongly Disagree",
];

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

  const categoryQuestions = useMemo(() => {
    return (questionnaireData[category] || questionnaireData["Values"]) as Question[];
  }, [category]);

  const currentQuestion = useMemo(() => {
    return (categoryQuestions[currentQuestionIndex] || categoryQuestions[0]) as Question;
  }, [categoryQuestions, currentQuestionIndex]);

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

  if (!currentQuestion || !categoryQuestions) return null;

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