import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Home,
  LayoutGrid,
  MapPin,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import aiNetwork from "@/assets/ai-network.png";
import m1 from "@/assets/match-1.jpg";
import m2 from "@/assets/match-2.jpg";
import m3 from "@/assets/match-3.jpg";

export const Route = createFileRoute("/matches-ready")({
  head: () => ({
    meta: [
      { title: "Your AI Matches Are Ready — Campus Connect AI" },
      {
        name: "description",
        content:
          "See the students our AI recommends for you, with compatibility scores and clear reasons behind every match.",
      },
      { property: "og:title", content: "Your AI Matches Are Ready — Campus Connect AI" },
      {
        property: "og:description",
        content: "40+ compatibility signals analyzed to reveal the students you'll thrive with.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MatchesReady,
});

type Match = {
  name: string;
  age: number;
  college: string;
  course: string;
  location: string;
  score: number;
  photo: string;
  reasons: string[];
  insight: string;
};

const matches: Match[] = [
  {
    name: "Ananya Rao",
    age: 20,
    college: "IIT Bombay",
    course: "Computer Science, 3rd Year",
    location: "Powai, Mumbai",
    score: 96,
    photo: m1,
    reasons: ["Similar Career Goals", "Strong Communication Match", "Same Learning Style"],
    insight:
      "You both enjoy building software projects and prefer collaborative learning environments.",
  },
  {
    name: "Rohan Mehta",
    age: 21,
    college: "BITS Pilani",
    course: "Electronics & Design, 4th Year",
    location: "Pilani, Rajasthan",
    score: 93,
    photo: m2,
    reasons: ["Shared Values", "Hackathon Energy", "Structured Planner"],
    insight:
      "You both plan work in clear milestones and thrive under friendly, competitive deadlines.",
  },
  {
    name: "Sara Iqbal",
    age: 20,
    college: "NIT Trichy",
    course: "Data Science, 3rd Year",
    location: "Trichy, Tamil Nadu",
    score: 91,
    photo: m3,
    reasons: ["Open Communication", "Hands-on Learner", "Similar Interests"],
    insight:
      "You both learn fastest by doing, and you share an interest in AI research and product design.",
  },
];

const quality = [
  { label: "Values", value: 98, tone: "from-brand-light to-brand-deep" },
  { label: "Communication", value: 95, tone: "from-sky-400 to-sky-600" },
  { label: "Learning Style", value: 93, tone: "from-mint to-emerald-500" },
  { label: "Career Goals", value: 91, tone: "from-amber-400 to-amber-600" },
  { label: "Lifestyle", value: 88, tone: "from-rose-400 to-rose-500" },
  { label: "Interests", value: 85, tone: "from-violet-400 to-violet-600" },
];

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return value;
}

function MatchesReady() {
  const [ready, setReady] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    const t1 = setTimeout(() => setReady(true), 1600);
    const t2 = setTimeout(() => setAnimate(true), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: `${(i * 37) % 96}%`,
        top: `${(i * 53) % 88}%`,
        size: 4 + ((i * 7) % 8),
        dur: `${5 + (i % 5)}s`,
        delay: `${(i % 6) * 0.6}s`,
      })),
    [],
  );

  const confidence = useCountUp(96, animate);

  if (!ready) return <LoadingState />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-[oklch(0.972_0.017_293)]">
      <main className="mx-auto flex w-full max-w-[430px] flex-col px-6 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
        {/* Hero */}
        <section className="fade-up relative h-[34vh] min-h-[230px] shrink-0">
          <div className="absolute inset-x-2 top-4 bottom-2 rounded-[44px] bg-[radial-gradient(circle_at_50%_45%,color-mix(in_oklab,var(--color-brand)_22%,transparent),transparent_68%)] animate-pulse" />
          {particles.map((p, i) => (
            <span
              key={i}
              aria-hidden
              className="absolute rounded-full bg-brand/30"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animation: `float ${p.dur} ease-in-out ${p.delay} infinite`,
              }}
            />
          ))}
          <img
            src={aiNetwork}
            alt="Glowing AI network connecting compatible students"
            width={1024}
            height={768}
            className="relative mx-auto h-full w-auto object-contain animate-[float_7s_ease-in-out_infinite]"
          />
        </section>

        <h1
          className="fade-up mt-3 text-center text-[34px] font-bold leading-[1.12] tracking-[-0.02em] text-ink"
          style={{ animationDelay: "80ms" }}
        >
          ✨ Your AI Matches Are Ready
        </h1>
        <p
          className="fade-up mx-auto mt-3 max-w-[92%] text-center text-base leading-[1.55] text-subtle"
          style={{ animationDelay: "150ms" }}
        >
          We analyzed over 40 compatibility signals to recommend students who are most likely to
          collaborate, learn and grow with you.
        </p>

        {/* AI summary glass card */}
        <section
          className="fade-up mt-7 rounded-3xl border border-white/60 bg-white/60 p-5 shadow-[0_24px_60px_-30px_rgba(18,18,18,0.4)] backdrop-blur-xl"
          style={{ animationDelay: "220ms" }}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-light to-brand-deep text-on-brand">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[18px] font-semibold tracking-[-0.01em] text-ink">
                Your Compatibility Profile
              </p>
              <p className="text-[13px] font-medium text-subtle">AI Summary</p>
            </div>
          </div>
          <p className="mt-4 text-[15px] leading-[1.6] text-ink/80">
            You are a collaborative learner who enjoys structured planning, open communication and
            hands-on projects. You work best with ambitious students who enjoy teamwork and
            continuous learning.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-light to-brand-deep px-4 py-2 text-[14px] font-semibold text-on-brand shadow-cta">
            Compatibility Confidence
            <span className="tabular-nums">{confidence}%</span>
          </div>
        </section>

        {/* Section title */}
        <div className="mt-8 flex items-end justify-between">
          <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-ink">
            Top Recommended Students
          </h2>
          <Link
            to="/explore-matches"
            className="flex items-center gap-0.5 text-[14px] font-semibold text-brand transition-transform active:scale-95"
          >
            See All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <section className="mt-4 space-y-5">
          {matches.map((m, i) => (
            <MatchCard
              key={m.name}
              match={m}
              index={i}
              animate={animate}
              saved={saved.includes(m.name)}
              onSave={() =>
                setSaved((s) =>
                  s.includes(m.name) ? s.filter((n) => n !== m.name) : [...s, m.name],
                )
              }
            />
          ))}
        </section>

        {/* Match quality */}
        <section
          className="fade-up mt-8 rounded-3xl border border-line bg-card p-5 shadow-[0_20px_50px_-30px_rgba(18,18,18,0.4)]"
          style={{ animationDelay: "300ms" }}
        >
          <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-ink">
            Why these matches?
          </h2>
          <div className="mt-5 space-y-4">
            {quality.map((q) => (
              <div key={q.label}>
                <div className="flex items-center justify-between text-[14px] font-medium text-ink">
                  <span>{q.label}</span>
                  <span className="tabular-nums text-subtle">{q.value}%</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${q.tone}`}
                    style={{
                      width: animate ? `${q.value}%` : "0%",
                      transition: "width 1.4s cubic-bezier(0.22,1,0.36,1)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[13px] leading-[1.5] text-subtle">
            These scores are calculated using your questionnaire responses.
          </p>
        </section>

        <Link
          to="/explore-matches"
          className="fade-up mt-7 flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-brand-light to-brand-deep text-[18px] font-semibold text-on-brand shadow-cta transition-transform active:scale-[0.97]"
          style={{ animationDelay: "340ms" }}
        >
          Show More Matches
        </Link>
      </main>

      {/* Floating bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[430px] px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <ul className="flex items-center justify-between rounded-[26px] border border-white/60 bg-white/80 px-2 py-2.5 shadow-[0_20px_46px_-24px_rgba(18,18,18,0.45)] backdrop-blur-xl">
          {[
            { label: "Home", icon: Home, path: "/home", active: false },
            { label: "Matches", icon: Users, path: "/explore-matches", active: true },
            { label: "Quiz", icon: BookOpen, path: "/questionnaire-intro", active: false },
            { label: "Groups", icon: LayoutGrid, path: "/home", active: false },
            { label: "Profile", icon: User, path: "/home", active: false },
          ].map(({ label, icon: Icon, path, active }) => (
            <li key={label} className="flex-1">
              <Link
                to={path}
                className={`flex h-12 w-full flex-col items-center justify-center gap-1 rounded-2xl transition-transform active:scale-95 ${
                  active ? "bg-brand/10 text-brand" : "text-subtle"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="text-[10px] font-semibold">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function MatchCard({
  match,
  index,
  animate,
  saved,
  onSave,
}: {
  match: Match;
  index: number;
  animate: boolean;
  saved: boolean;
  onSave: () => void;
}) {
  const score = useCountUp(match.score, animate, 1200 + index * 200);

  return (
    <article
      className="fade-up rounded-[26px] border border-line bg-card p-5 shadow-[0_22px_54px_-32px_rgba(18,18,18,0.45)]"
      style={{ animationDelay: `${240 + index * 110}ms` }}
    >
      <div className="flex items-start gap-4">
        <img
          src={match.photo}
          alt={`${match.name}, student at ${match.college}`}
          loading="lazy"
          width={128}
          height={128}
          className="h-[68px] w-[68px] shrink-0 rounded-full object-cover ring-2 ring-brand/25"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[18px] font-semibold tracking-[-0.01em] text-ink">
              {match.name}
            </h3>
            <span className="text-[14px] font-medium text-subtle">{match.age}</span>
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-[14px] font-medium text-ink/75">
            <GraduationCap className="h-4 w-4 text-brand" />
            <span className="truncate">{match.college}</span>
          </p>
          <p className="truncate text-[13px] text-subtle">{match.course}</p>
          <p className="mt-1 flex items-center gap-1 text-[12px] text-subtle">
            <MapPin className="h-3.5 w-3.5" />
            {match.location}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-2">
          <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-brand/10 text-[17px] font-bold tabular-nums text-brand">
            {score}%
          </div>
          <button
            type="button"
            onClick={onSave}
            aria-label={saved ? `Remove ${match.name} from saved` : `Save ${match.name} for later`}
            aria-pressed={saved}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-transform active:scale-75 ${
              saved ? "border-brand bg-brand/10 text-brand" : "border-line text-subtle"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {match.reasons.map((r) => (
          <span
            key={r}
            className="rounded-full bg-mint/12 px-3 py-1.5 text-[12px] font-semibold text-mint"
          >
            ✓ {r}
          </span>
        ))}
      </div>

      <p className="mt-4 rounded-2xl bg-brand/6 px-4 py-3 text-[14px] leading-[1.55] text-ink/75">
        <span className="font-semibold text-brand">AI Insight · </span>
        {match.insight}
      </p>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          className="h-12 flex-1 rounded-2xl bg-gradient-to-r from-brand-light to-brand-deep text-[16px] font-semibold text-on-brand shadow-cta transition-transform active:scale-[0.96]"
        >
          View Profile
        </button>
        <button
          type="button"
          onClick={onSave}
          className="h-12 flex-1 rounded-2xl border border-line bg-card text-[16px] font-semibold text-subtle transition-transform active:scale-[0.96]"
        >
          {saved ? "Saved" : "Save For Later"}
        </button>
      </div>
    </article>
  );
}

function LoadingState() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center bg-gradient-to-b from-background to-[oklch(0.972_0.017_293)] px-8 text-center">
      <div className="relative flex h-40 w-40 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-brand/15 animate-ping" />
        <span className="absolute inset-6 rounded-full bg-brand/20 animate-pulse" />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-light to-brand-deep text-on-brand shadow-cta">
          <Sparkles className="h-7 w-7" />
        </span>
      </div>
      <p className="mt-8 text-[20px] font-semibold tracking-[-0.01em] text-ink">
        Finding your most compatible students...
      </p>
      <div className="mt-5 flex items-center gap-2" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 rounded-full bg-brand"
            style={{ animation: `float 1.4s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </main>
  );
}
