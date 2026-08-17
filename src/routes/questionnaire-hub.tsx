import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Brain,
  Check,
  ChevronRight,
  Clock,
  Compass,
  Globe,
  GraduationCap,
  Heart,
  HelpCircle,
  Lock,
  MessageCircle,
  Palette,
  Sparkles,
  Target,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/questionnaire-hub")({
  head: () => ({
    meta: [
      { title: "Questionnaire Hub — Campus Connect AI" },
      {
        name: "description",
        content:
          "Track your compatibility journey across values, personality, communication, learning style, career goals, lifestyle and interests.",
      },
    ],
  }),
  component: QuestionnaireHub,
});

type Status = "current" | "locked" | "completed";

const RING = 2 * Math.PI * 52;

function QuestionnaireHub() {
  const router = useRouter();
  const [answered, setAnswered] = useState(0);
  const [sectionProgress, setSectionProgress] = useState<Record<string, number>>({});
  const total = 40;
  const percent = Math.round((answered / total) * 100);
  const [ringPercent, setRingPercent] = useState(0);

  const sections: {
    icon: any;
    emoji: string;
    title: string;
    count: number;
    description: string;
    tone: string;
  }[] = [
    {
      icon: Heart,
      emoji: "❤️",
      title: "Values",
      count: 6,
      description: "Help us understand what matters most to you.",
      tone: "bg-brand/10 text-brand",
    },
    {
      icon: Brain,
      emoji: "🧠",
      title: "Personality",
      count: 8,
      description: "Tell us how you think, work and interact with others.",
      tone: "bg-rose-100 text-rose-500",
    },
    {
      icon: MessageCircle,
      emoji: "💬",
      title: "Communication",
      count: 6,
      description: "Describe how you prefer to communicate and collaborate.",
      tone: "bg-sky-100 text-sky-600",
    },
    {
      icon: GraduationCap,
      emoji: "📚",
      title: "Learning Style",
      count: 5,
      description: "Tell us how you learn best.",
      tone: "bg-amber-100 text-amber-600",
    },
    {
      icon: Target,
      emoji: "🎯",
      title: "Career Goals",
      count: 5,
      description: "Help us understand your future ambitions.",
      tone: "bg-mint/15 text-mint",
    },
    {
      icon: Globe,
      emoji: "🌍",
      title: "Lifestyle",
      count: 5,
      description: "Tell us about your daily habits and preferences.",
      tone: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: Palette,
      emoji: "🎨",
      title: "Interests & Hobbies",
      count: 5,
      description: "Share your hobbies and interests.",
      tone: "bg-violet-100 text-violet-600",
    },
  ];

  useEffect(() => {
    async function fetchProgress() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) return;

      const { data } = await supabase
        .from('questionnaire_responses')
        .select('category')
        .eq('user_id', session.user.id);

      if (data) {
        setAnswered(data.length);
        const progressMap: Record<string, number> = {};
        
        const sectionMax: Record<string, number> = {
          "Values": 6,
          "Personality": 8,
          "Communication": 6,
          "Learning Style": 5,
          "Career Goals": 5,
          "Lifestyle": 5,
          "Interests & Hobbies": 5
        };

        (data as any[]).forEach(resp => {
          if (resp.category) {
            if (!progressMap[resp.category]) progressMap[resp.category] = 0;
            progressMap[resp.category]++;
          }
        });

        const finalMap: Record<string, number> = {};
        Object.keys(sectionMax).forEach(cat => {
          const count = progressMap[cat] || 0;
          const max = sectionMax[cat] || 1;
          finalMap[cat] = Math.min(Math.round((count / max) * 100), 100);
        });

        setSectionProgress(finalMap);
      }
    }
    fetchProgress();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setRingPercent(percent), 250);
    return () => clearTimeout(t);
  }, [percent]);

  const handleSectionClick = (title: string) => {
    router.navigate({ 
      to: "/question", 
      search: { category: title } 
    });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-background px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="relative flex h-12 shrink-0 items-center justify-center">
        <button
          type="button"
          onClick={() => router.history.back()}
          className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full text-ink transition-transform active:scale-90"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
          Compatibility Profile
        </h1>
        <button
          type="button"
          className="absolute right-0 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card text-subtle transition-transform active:scale-90"
        >
          <HelpCircle className="h-[18px] w-[18px]" />
        </button>
      </header>

      <section className="fade-up mt-6">
        <h2 className="text-[32px] font-bold leading-[1.15] tracking-[-0.02em] text-ink">
          Build Your Compatibility Profile
        </h2>
        <p className="mt-3 text-base leading-[1.55] text-subtle">
          Complete each section to help our AI recommend the most compatible students for you.
        </p>
      </section>

      {/* Overall progress */}
      <section
        className="fade-up mt-6 flex items-center gap-5 rounded-3xl border border-line bg-card p-5 shadow-[0_18px_44px_-28px_rgba(18,18,18,0.35)]"
      >
        <div className="relative h-[124px] w-[124px] shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" strokeWidth="10" className="stroke-line" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              className="stroke-brand"
              strokeDasharray={RING}
              strokeDashoffset={RING - (RING * ringPercent) / 100}
              style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[26px] font-bold leading-none text-ink">{percent}%</span>
            <span className="mt-1 text-[11px] font-medium text-subtle">
              {answered} / {total} Questions
            </span>
          </div>
        </div>
        <div>
          <p className="text-[20px] font-semibold tracking-[-0.01em] text-ink">Overall Progress</p>
          <p className="mt-1 text-[15px] text-subtle">AI Match Readiness</p>
          <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1.5 text-[14px] font-semibold text-brand">
            <Clock className="h-4 w-4" />8 Minutes
          </span>
        </div>
      </section>

      {/* Sections */}
      <section className="mt-6 space-y-4">
        {sections.map((section, i) => {
          const progress = sectionProgress[section.title] || 0;
          const isCompleted = progress === 100;
          
          return (
            <button
              key={section.title}
              type="button"
              onClick={() => handleSectionClick(section.title)}
              className="fade-up flex w-full items-start gap-4 rounded-3xl border p-5 text-left shadow-[0_18px_44px_-30px_rgba(18,18,18,0.4)] border-brand/30 bg-card active:shadow-[0_24px_50px_-26px_rgba(109,94,247,0.55)] transition-all active:scale-[0.98]"
              style={{ animationDelay: `${200 + i * 80}ms` }}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[20px] ${section.tone}`}
              >
                <span aria-hidden>{section.emoji}</span>
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-[20px] font-semibold tracking-[-0.01em] text-ink">
                    {section.title}
                  </span>
                  {isCompleted ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  ) : (
                    <span className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-on-brand animate-pulse">
                      {progress > 0 ? "Resume" : "Start"}
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-[15px] leading-[1.45] text-subtle">
                  {section.description}
                </span>
                <span className="mt-2 flex items-center gap-2 text-[13px] font-medium text-subtle">
                  <span>{section.count} Questions</span>
                  <span className="h-1 w-1 rounded-full bg-line" />
                  {isCompleted ? (
                    <span className="text-emerald-500">Completed</span>
                  ) : (
                    <span>{progress}% complete</span>
                  )}
                </span>
              </span>

              <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-subtle" />
            </button>
          );
        })}
      </section>

      {/* Bottom Action */}
      <button
        type="button"
        onClick={() => router.navigate({ to: "/matches-ready" })}
        className="fade-up mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-light to-brand-deep text-[18px] font-semibold text-on-brand shadow-cta transition-transform active:scale-[0.97]"
      >
        <Compass className="h-5 w-5" />
        View Initial Matches
      </button>

      <p className="mt-4 text-center text-[13px] leading-[1.5] text-subtle">
        Your progress is automatically saved to your profile.
      </p>
    </main>
  );
}