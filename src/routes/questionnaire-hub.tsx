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
  MessageCircle,
  Palette,
  Target,
  Loader2,
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

const RING = 2 * Math.PI * 52;

type CategorySection = {
  name: string;
  emoji: string | null;
  description: string | null;
  tone: string | null;
  count: number;
  display_order: number;
};

// Map category names to lucide icons (for UI consistency)
const categoryIcons: Record<string, any> = {
  "Values": Heart,
  "Personality": Brain,
  "Communication": MessageCircle,
  "Learning Style": GraduationCap,
  "Career Goals": Target,
  "Lifestyle": Globe,
  "Interests & Hobbies": Palette,
};

// Fallback tones matching the hardcoded design
const categoryTones: Record<string, string> = {
  "Values": "bg-brand/10 text-brand",
  "Personality": "bg-rose-100 text-rose-500",
  "Communication": "bg-sky-100 text-sky-600",
  "Learning Style": "bg-amber-100 text-amber-600",
  "Career Goals": "bg-mint/15 text-mint",
  "Lifestyle": "bg-emerald-100 text-emerald-600",
  "Interests & Hobbies": "bg-violet-100 text-violet-600",
};

function QuestionnaireHub() {
  const router = useRouter();
  const [answered, setAnswered] = useState(0);
  const [sectionProgress, setSectionProgress] = useState<Record<string, number>>({});
  const [sections, setSections] = useState<CategorySection[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ringPercent, setRingPercent] = useState(0);

  // Fetch categories with question counts from database
  useEffect(() => {
    let mounted = true;
    async function fetchCategories() {
      setLoading(true);
      const { data: categories, error } = await supabase
        .from('questionnaire_categories')
        .select(`
          name,
          emoji,
          description,
          tone,
          display_order,
          questionnaire_questions (
            id
          )
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (mounted) {
        if (error) {
          console.error('Error fetching categories:', error);
        } else if (categories) {
          const sectionData: CategorySection[] = categories.map(cat => ({
            name: cat.name,
            emoji: cat.emoji ?? '',
            description: cat.description ?? '',
            tone: cat.tone ?? categoryTones[cat.name] ?? 'bg-brand/10 text-brand',
            count: cat.questionnaire_questions?.length || 0,
            display_order: cat.display_order,
          }));
          setSections(sectionData);
          setTotalQuestions(sectionData.reduce((sum, s) => sum + s.count, 0));
        }
        setLoading(false);
      }
    }
    fetchCategories();
    return () => { mounted = false; };
  }, []);

  // Fetch user's progress
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

        // Build sectionMax from fetched sections
        const sectionMax: Record<string, number> = {};
        sections.forEach(s => { sectionMax[s.name] = s.count; });

        (data as any[]).forEach(resp => {
          if (resp.category) {
            const current = progressMap[resp.category] || 0;
            progressMap[resp.category] = current + 1;
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
  }, [sections]);

  const percent = totalQuestions > 0 ? Math.round((answered / totalQuestions) * 100) : 0;

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

  if (loading) {
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
        </header>
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      </main>
    );
  }

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
              {answered} / {totalQuestions} Questions
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
          const progress = sectionProgress[section.name] || 0;
          const isCompleted = progress === 100;

          return (
            <button
              key={section.name}
              type="button"
              onClick={() => handleSectionClick(section.name)}
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
                    {section.name}
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