import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bell,
  ChevronRight,
  Users,
  Rocket,
  Code2,
  Briefcase,
  Network,
  FlaskConical,
  BookOpen,
  Cloud,
  Brain,
  Camera,
  Calendar,
  MapPin,
  Home as HomeIcon,
  Heart,
  ClipboardList,
  User,
  Loader2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import match1 from "@/assets/match-1.jpg";
import match2 from "@/assets/match-2.jpg";
import match3 from "@/assets/match-3.jpg";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — Campus Connect AI" },
      {
        name: "description",
        content:
          "Your personalized Campus Connect AI dashboard: profile strength, top matches, communities and campus events.",
      },
      { property: "og:title", content: "Home — Campus Connect AI" },
      {
        property: "og:description",
        content: "Profile strength, top matches, communities and upcoming campus events.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeDashboard,
});

const quickActions = [
  { label: "Study Partner", icon: BookOpen, from: "from-brand", to: "to-brand-light" },
  { label: "Hackathon Team", icon: Code2, from: "from-sky-400", to: "to-blue-600" },
  { label: "Startup", icon: Rocket, from: "from-amber-400", to: "to-orange-500" },
  { label: "Placement Prep", icon: Briefcase, from: "from-mint", to: "to-emerald-600" },
  { label: "Networking", icon: Network, from: "from-pink-400", to: "to-rose-500" },
  { label: "Research", icon: FlaskConical, from: "from-violet-400", to: "to-fuchsia-500" },
];

const matches = [
  { name: "Arjun Sharma", age: 22, college: "RV College of Engineering", score: 92, photo: match1 },
  { name: "Ananya Reddy", age: 21, college: "IIIT Hyderabad", score: 89, photo: match2 },
  { name: "Vikram Mehta", age: 22, college: "COEP Pune", score: 86, photo: match3 },
];

const communities = [
  { name: "Artificial Intelligence", members: "12.4k members", icon: Brain, from: "from-brand", to: "to-brand-light" },
  { name: "Cloud Computing", members: "8.1k members", icon: Cloud, from: "from-sky-400", to: "to-blue-600" },
  { name: "Python Developers", members: "15.2k members", icon: Code2, from: "from-mint", to: "to-emerald-600" },
  { name: "Photography Club", members: "3.9k members", icon: Camera, from: "from-pink-400", to: "to-rose-500" },
  { name: "Startup Founders", members: "6.7k members", icon: Rocket, from: "from-amber-400", to: "to-orange-500" },
];

const events = [
  { name: "Azure Workshop", date: "12 Aug · 4:00 PM", place: "Block C Auditorium", from: "from-sky-400", to: "to-blue-600" },
  { name: "Hackathon 2026", date: "19 Aug · 9:00 AM", place: "Innovation Lab", from: "from-brand", to: "to-brand-light" },
  { name: "Startup Meetup", date: "24 Aug · 6:30 PM", place: "Koramangala Hub", from: "from-amber-400", to: "to-orange-500" },
  { name: "AI Bootcamp", date: "02 Sep · 10:00 AM", place: "Central Library", from: "from-mint", to: "to-emerald-600" },
];

const navItems = [
  { label: "Home", icon: HomeIcon, active: true },
  { label: "Matches", icon: Heart, active: false },
  { label: "Questionnaire", icon: ClipboardList, active: false },
  { label: "Communities", icon: Users, active: false },
  { label: "Profile", icon: User, active: false },
];

function HomeDashboard() {
  const [progress, setProgress] = useState(0);
  const [userName, setUserName] = useState("Student");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', session.user.id)
            .single();
          
          if (profile?.display_name) {
            setUserName(profile.display_name.split(' ')[0] || "Student");
          }

          // Fetch profile and academic profile to calculate strength
          const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          const { data: acad } = await supabase.from('academic_profiles').select('*').eq('id', session.user.id).single();
          
          let strength = 0;
          if (prof) {
            if (prof.display_name) strength += 10;
            if (prof.age) strength += 10;
            if (prof.gender) strength += 10;
            if (prof.city) strength += 10;
            if (prof.avatar_url) strength += 10;
          }
          if (acad) {
            if (acad.university) strength += 10;
            if (acad.degree) strength += 10;
            if (acad.skills?.length) strength += 10;
            if (acad.interests?.length) strength += 10;
            if (acad.career_goal) strength += 10;
          }
          
          setProgress(strength || 0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] bg-background pb-[calc(7rem+env(safe-area-inset-bottom))] pt-[max(3.25rem,calc(env(safe-area-inset-top)+2rem))]">
      <header className="fade-up grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 px-6">
        <div className="min-w-0">
          <h1 className="truncate text-[32px] font-bold tracking-[-0.02em] text-ink">Hi, {userName} 👋</h1>
          <p className="mt-1 text-sm text-subtle">Ready to find your perfect match?</p>
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-card shadow-[0_10px_24px_-14px_rgba(18,18,18,0.45)] ring-1 ring-line transition-transform duration-150 active:scale-[0.94]"
        >
          <Bell className="h-5 w-5 text-ink" />
          <span className="absolute right-3 top-3 h-2.5 w-2.5 animate-pulse rounded-full bg-danger ring-2 ring-card" />
        </button>
      </header>

      <section
        className="fade-up mx-6 mt-7 rounded-[20px] border border-line/70 bg-card p-6 shadow-[0_18px_40px_-26px_rgba(18,18,18,0.4)]"
        style={{ animationDelay: "80ms" }}
      >
        <h2 className="text-base font-semibold text-ink">Your Profile Strength</h2>
        <p className="mt-2 text-[40px] font-extrabold leading-none tracking-[-0.02em] text-brand">{progress}%</p>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-brand-light transition-[width] duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-subtle">
          Complete your profile to receive even better recommendations.
        </p>
        <Link
          to="/profile-setup"
          className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-brand to-brand-light text-[15px] font-semibold text-on-brand shadow-cta transition-transform duration-150 active:scale-[0.97]"
        >
          Complete Profile
        </Link>
      </section>

      <section className="fade-up mt-9" style={{ animationDelay: "140ms" }}>
        <h2 className="px-6 text-[22px] font-bold tracking-[-0.01em] text-ink">Quick Actions</h2>
        <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {quickActions.map(({ label, icon: Icon, from, to }) => (
            <button
              key={label}
              type="button"
              className="flex w-[104px] shrink-0 snap-start flex-col items-center gap-3 rounded-[18px] border border-line/70 bg-card p-4 shadow-[0_12px_28px_-24px_rgba(18,18,18,0.5)] transition-transform duration-150 active:scale-[0.96]"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${from} ${to}`}>
                <Icon className="h-5 w-5 text-on-brand" />
              </span>
              <span className="text-center text-[13px] font-semibold leading-tight text-ink">{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="fade-up mt-9 px-6" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[22px] font-bold tracking-[-0.01em] text-ink">Top Matches for You</h2>
          <Link to="/explore-matches" className="shrink-0 text-sm font-semibold text-brand transition-transform active:scale-95">
            See All
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {matches.map((m) => (
            <button
              key={m.name}
              type="button"
              className="flex w-full items-center gap-4 rounded-[18px] border border-line/70 bg-card p-4 text-left shadow-[0_14px_32px_-28px_rgba(18,18,18,0.6)] transition-transform duration-150 active:scale-[0.98]"
            >
              <img
                src={m.photo}
                alt={m.name}
                loading="lazy"
                width={512}
                height={512}
                className="h-14 w-14 shrink-0 rounded-full object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-semibold text-ink">{m.name}</span>
                <span className="mt-0.5 block truncate text-sm text-subtle">
                  {m.age} · {m.college}
                </span>
                <span className="mt-1 block text-[13px] font-semibold text-mint">
                  {m.score}% Compatible
                </span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-subtle" />
            </button>
          ))}
        </div>
      </section>

      <section className="fade-up mt-9" style={{ animationDelay: "260ms" }}>
        <h2 className="px-6 text-[22px] font-bold tracking-[-0.01em] text-ink">
          Communities You May Like
        </h2>
        <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {communities.map(({ name, members, icon: Icon, from, to }) => (
            <article
              key={name}
              className="w-[190px] shrink-0 snap-start overflow-hidden rounded-[18px] border border-line/70 bg-card shadow-[0_14px_32px_-28px_rgba(18,18,18,0.6)]"
            >
              <div className={`flex h-24 items-center justify-center bg-gradient-to-br ${from} ${to}`}>
                <Icon className="h-9 w-9 text-on-brand" />
              </div>
              <div className="p-4">
                <h3 className="truncate text-[15px] font-semibold text-ink">{name}</h3>
                <p className="mt-1 text-[13px] text-subtle">{members}</p>
                <button
                  type="button"
                  className="mt-3 h-9 w-full rounded-xl bg-brand/10 text-[13px] font-semibold text-brand transition-transform duration-150 active:scale-[0.96]"
                >
                  Join
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="fade-up mt-9" style={{ animationDelay: "320ms" }}>
        <h2 className="px-6 text-[22px] font-bold tracking-[-0.01em] text-ink">Upcoming Events</h2>
        <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {events.map((e) => (
            <article
              key={e.name}
              className="w-[230px] shrink-0 snap-start overflow-hidden rounded-[18px] border border-line/70 bg-card shadow-[0_14px_32px_-28px_rgba(18,18,18,0.6)]"
            >
              <div className={`h-24 bg-gradient-to-br ${e.from} ${e.to}`} />
              <div className="p-4">
                <h3 className="truncate text-[15px] font-semibold text-ink">{e.name}</h3>
                <p className="mt-2 flex items-center gap-1.5 text-[13px] text-subtle">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{e.date}</span>
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-[13px] text-subtle">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{e.place}</span>
                </p>
                <button
                  type="button"
                  className="mt-3 h-9 w-full rounded-xl bg-gradient-to-r from-brand to-brand-light text-[13px] font-semibold text-on-brand transition-transform duration-150 active:scale-[0.96]"
                >
                  Register
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-[520px] px-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between rounded-[22px] border border-line/70 bg-card px-3 py-3 shadow-[0_20px_44px_-22px_rgba(18,18,18,0.45)]">
          {[
            { label: "Home", icon: HomeIcon, path: "/home", active: true },
            { label: "Matches", icon: Heart, path: "/explore-matches", active: false },
            { label: "Questionnaire", icon: ClipboardList, path: "/questionnaire-intro", active: false },
            { label: "Communities", icon: Users, path: "/home", active: false },
            { label: "Profile", icon: User, path: "/home", active: false },
          ].map(({ label, icon: Icon, path, active }) => (
            <Link
              key={label}
              to={path}
              className="flex flex-1 flex-col items-center gap-1 transition-transform duration-150 active:scale-[0.9]"
            >
              <Icon className={`h-5 w-5 ${active ? "text-brand" : "text-subtle"}`} />
              <span
                className={`w-full truncate px-0.5 text-center text-[9.5px] font-semibold ${active ? "text-brand" : "text-subtle"}`}
              >
                {label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
