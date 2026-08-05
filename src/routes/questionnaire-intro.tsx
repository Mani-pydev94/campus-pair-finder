import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  Clock,
  GraduationCap,
  Heart,
  Lightbulb,
  Rocket,
  Sparkles,
  Trophy,
  Users,
  UserPlus,
  Check,
} from "lucide-react";
import hero from "@/assets/questionnaire-hero.png";

export const Route = createFileRoute("/questionnaire-intro")({
  head: () => ({
    meta: [
      { title: "Compatibility Profile — Campus Connect AI" },
      {
        name: "description",
        content:
          "Answer 40 quick questions so Campus Connect AI can match you with students who share your personality, learning style and goals.",
      },
      { property: "og:title", content: "Compatibility Profile — Campus Connect AI" },
      {
        property: "og:description",
        content: "Let our AI understand you better and unlock truly compatible student matches.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuestionnaireIntro,
});

const discoveries = [
  { label: "Study Partners", icon: BookOpen, tone: "bg-brand/10 text-brand" },
  { label: "Project Teammates", icon: Users, tone: "bg-mint/15 text-mint" },
  { label: "Hackathon Teams", icon: Trophy, tone: "bg-amber-100 text-amber-600" },
  { label: "Startup Co-founders", icon: Rocket, tone: "bg-rose-100 text-rose-500" },
  { label: "Placement Buddies", icon: Briefcase, tone: "bg-sky-100 text-sky-600" },
  { label: "Friends with Similar Interests", icon: UserPlus, tone: "bg-emerald-100 text-emerald-600" },
];

const sections = [
  { label: "Values", count: 6 },
  { label: "Personality", count: 8 },
  { label: "Communication", count: 6 },
  { label: "Learning Style", count: 5 },
  { label: "Career Goals", count: 5 },
  { label: "Lifestyle", count: 5 },
  { label: "Interests", count: 5 },
];

const floaters = [
  { icon: GraduationCap, className: "left-1 top-4 bg-brand/10 text-brand", delay: "0s", dur: "6s" },
  { icon: Lightbulb, className: "right-2 top-2 bg-amber-100 text-amber-500", delay: "0.9s", dur: "7s" },
  { icon: Heart, className: "left-3 bottom-8 bg-rose-100 text-rose-500", delay: "1.4s", dur: "6.5s" },
  { icon: Rocket, className: "right-1 bottom-10 bg-mint/15 text-mint", delay: "0.4s", dur: "7.5s" },
  { icon: BookOpen, className: "right-1/3 -top-1 bg-sky-100 text-sky-600", delay: "1.8s", dur: "8s" },
];

function QuestionnaireIntro() {
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-background px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="relative flex h-12 shrink-0 items-center justify-center">
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label="Go back"
          className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full text-ink transition-transform active:scale-90"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
          Compatibility Profile
        </h1>
      </header>

      {/* Hero */}
      <section
        className="fade-up relative mt-2 h-[35vh] min-h-[240px] shrink-0"
        style={{ animationDelay: "40ms" }}
      >
        <div className="absolute inset-x-4 top-6 bottom-4 rounded-[40px] bg-gradient-to-b from-brand/10 via-brand/5 to-transparent" />
        <img
          src={hero}
          alt="Students connected by glowing lines of compatibility"
          width={1024}
          height={768}
          className="relative mx-auto h-full w-auto object-contain animate-[float_7s_ease-in-out_infinite]"
        />
        {floaters.map(({ icon: Icon, className, delay, dur }, i) => (
          <span
            key={i}
            aria-hidden
            className={`absolute flex h-11 w-11 items-center justify-center rounded-2xl shadow-[0_10px_24px_-14px_rgba(0,0,0,0.35)] ${className}`}
            style={{ animation: `float ${dur} ease-in-out ${delay} infinite` }}
          >
            <Icon className="h-5 w-5" />
          </span>
        ))}
      </section>

      <h2
        className="fade-up mt-4 text-center text-[32px] font-bold leading-[1.15] tracking-[-0.02em] text-ink"
        style={{ animationDelay: "140ms" }}
      >
        Let's understand you better ✨
      </h2>

      <p
        className="fade-up mx-auto mt-3 max-w-[80%] text-center text-base leading-[1.55] text-subtle"
        style={{ animationDelay: "200ms" }}
      >
        Answer a few simple questions so our AI can recommend students who truly match your
        personality, interests, learning style and future goals.
      </p>

      {/* Discover card */}
      <section
        className="fade-up mt-8 rounded-3xl border border-line bg-card p-5 shadow-[0_18px_44px_-28px_rgba(18,18,18,0.35)]"
        style={{ animationDelay: "260ms" }}
      >
        <h3 className="text-[20px] font-semibold tracking-[-0.01em] text-ink">
          After completing your profile you'll discover:
        </h3>
        <ul className="mt-4 space-y-3">
          {discoveries.map(({ label, icon: Icon, tone }, i) => (
            <li
              key={label}
              className="fade-up flex items-center gap-3"
              style={{ animationDelay: `${340 + i * 90}ms` }}
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="text-[15px] font-medium text-ink">{label}</span>
              <Check className="ml-auto h-4 w-4 text-emerald-500" />
            </li>
          ))}
        </ul>
      </section>

      {/* Overview card */}
      <section
        className="fade-up mt-5 rounded-3xl border border-line bg-card p-5 shadow-[0_18px_44px_-28px_rgba(18,18,18,0.35)]"
        style={{ animationDelay: "420ms" }}
      >
        <h3 className="text-[20px] font-semibold tracking-[-0.01em] text-ink">
          Questionnaire Overview
        </h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {sections.map(({ label, count }) => (
            <span
              key={label}
              className="rounded-full border border-line bg-secondary/60 px-3 py-2 text-[13px] font-medium text-ink"
            >
              {label}
              <span className="ml-1.5 text-subtle">{count}</span>
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-brand/8 px-4 py-3">
          <div>
            <p className="text-[13px] font-medium text-subtle">Total</p>
            <p className="text-[17px] font-semibold text-ink">40 Questions</p>
          </div>
          <div className="flex items-center gap-2 text-brand">
            <Clock className="h-4 w-4" />
            <span className="text-[15px] font-semibold">8–10 Minutes</span>
          </div>
        </div>
      </section>

      {/* AI insight */}
      <section
        className="fade-up mt-5 rounded-3xl bg-gradient-to-br from-brand to-brand-deep p-5 text-on-brand shadow-cta"
        style={{ animationDelay: "500ms" }}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
          <Sparkles className="h-5 w-5" />
        </span>
        <p className="mt-3 text-[15px] leading-[1.6] text-on-brand/90">
          Our AI doesn't judge your answers. It simply finds students who think, learn and
          collaborate in ways that are most compatible with you. This creates better friendships,
          stronger teams and more successful collaborations.
        </p>
      </section>

      {/* Actions */}
      <div className="fade-up mt-7 space-y-3" style={{ animationDelay: "560ms" }}>
        <button
          type="button"
          className="h-14 w-full rounded-2xl bg-gradient-to-r from-brand-light to-brand-deep text-[18px] font-semibold text-on-brand shadow-cta transition-transform active:scale-[0.97]"
        >
          Start Questionnaire
        </button>
        <button
          type="button"
          onClick={() => router.history.back()}
          className="h-14 w-full rounded-2xl border border-line bg-card text-[18px] font-semibold text-subtle transition-transform active:scale-[0.97]"
        >
          Maybe Later
        </button>
      </div>

      <p className="mt-4 text-center text-[13px] text-subtle">
        You can leave anytime and continue later.
      </p>
    </main>
  );
}
