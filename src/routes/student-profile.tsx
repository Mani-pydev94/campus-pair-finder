import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { 
  ArrowLeft, 
  Bookmark, 
  Share2, 
  Sparkles, 
  CheckCircle2, 
  BadgeCheck, 
  MapPin, 
  GraduationCap, 
  BookOpen,
  Trophy,
  MessageCircle,
  Flag,
  Users,
  Home,
  ClipboardList,
  Globe,
  User,
  Zap,
  Lightbulb,
  Target,
  BrainCircuit,
  Rocket,
  Code2
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Import asset
import sophiaImg from "@/assets/matches/student-1.jpg";

export const Route = createFileRoute("/student-profile")({
  head: () => ({
    meta: [
      { title: "Sophia Johnson — AI Compatibility Profile" },
      {
        name: "description",
        content: "Understand why Sophia Johnson is your perfect academic and project collaborator.",
      },
      { property: "og:title", content: "Sophia Johnson — AI Compatibility Profile" },
      {
        property: "og:description",
        content: "Understand why Sophia Johnson is your perfect academic and project collaborator.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudentProfileScreen,
});

function StudentProfileScreen() {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(96), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-white pb-[max(7rem,env(safe-area-inset-bottom)+2.5rem)] pt-[max(1rem,env(safe-area-inset-top))]">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => router.history.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition-transform active:scale-90"
        >
          <ArrowLeft className="h-5 w-5 text-ink" />
        </button>
        <h1 className="text-[17px] font-bold tracking-tight text-ink">Student Profile</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition-all active:scale-90"
          >
            <Bookmark className={cn("h-4 w-4", isBookmarked ? "fill-brand text-brand" : "text-ink")} />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition-transform active:scale-90">
            <Share2 className="h-4 w-4 text-ink" />
          </button>
        </div>
      </header>

      <div className="px-6 space-y-8 mt-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center fade-up">
          <div className="relative">
            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-brand/5 shadow-xl animate-in zoom-in duration-700">
              <img src={sophiaImg} alt="Sophia Johnson" className="h-full w-full object-cover" />
            </div>
            <div className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white shadow-lg border-2 border-white">
              <BadgeCheck className="h-5 w-5" />
            </div>
          </div>
          
          <div className="mt-5 space-y-1">
            <h2 className="text-[34px] font-bold tracking-tight text-ink">Sophia Johnson, 21</h2>
            <p className="flex items-center justify-center gap-1.5 text-[16px] font-medium text-subtle">
              <GraduationCap className="h-4 w-4 text-brand" />
              Stanford University
            </p>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="text-[14px] font-semibold text-subtle px-3 py-1 bg-[#F5F5F7] rounded-full">Computer Science</span>
              <span className="flex items-center gap-1 text-[14px] font-semibold text-subtle">
                <MapPin className="h-3.5 w-3.5" />
                San Francisco
              </span>
            </div>
          </div>
        </div>

        {/* Hero AI Insight Card */}
        <div className="fade-up" style={{ animationDelay: '100ms' }}>
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-brand via-brand to-brand-deep p-8 text-white shadow-2xl shadow-brand/20">
            <Sparkles className="absolute -right-4 -top-4 h-32 w-32 text-white/10 rotate-12" aria-hidden />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-[18px] font-bold">Why AI Recommends Sophia</h3>
              </div>
              
              <p className="text-[20px] font-medium leading-[1.6] text-white/95">
                Sophia shares your passion for AI, collaborative learning and hackathons. Both of you prefer structured planning and open communication.
              </p>
              
              <p className="text-[15px] leading-relaxed text-white/80">
                She is likely to be an excellent teammate for technical projects and placement preparation due to your matching productivity cycles and career growth ambitions.
              </p>
            </div>

            {/* Compatibility Score Overlay */}
            <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-6">
              <div className="relative h-20 w-20">
                <svg className="h-20 w-20 -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-white/10"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={213.6}
                    strokeDashoffset={213.6 * (1 - progress / 100)}
                    strokeLinecap="round"
                    className="text-white transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[18px] font-bold">
                  {progress}%
                </div>
              </div>
              <div>
                <p className="text-[17px] font-bold">Compatible</p>
                <p className="text-[14px] text-white/70">Excellent Collaboration Potential</p>
              </div>
            </div>
          </div>
        </div>

        {/* Compatibility Breakdown */}
        <section className="fade-up space-y-4" style={{ animationDelay: '200ms' }}>
          <h3 className="text-[22px] font-bold text-ink px-1">Compatibility Breakdown</h3>
          <div className="rounded-[28px] bg-white border border-line/60 p-6 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.04)] space-y-6">
            {[
              { label: "Values", score: 97, color: "bg-brand", desc: "Highly aligned principles" },
              { label: "Learning Style", score: 95, color: "bg-mint", desc: "Both prefer project-based" },
              { label: "Communication", score: 94, color: "bg-blue-500", desc: "Clear & direct styles" },
              { label: "Career Goals", score: 93, color: "bg-orange-400", desc: "Tech & Startup focused" },
              { label: "Lifestyle", score: 90, color: "bg-emerald-500", desc: "Similar routine & habits" },
              { label: "Interests", score: 88, color: "bg-purple-500", desc: "Strong technical overlap" },
            ].map((item, idx) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-[14px] font-bold text-ink">
                  <span>{item.label}</span>
                  <span>{item.score}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#F5F5F7] overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000 ease-out", item.color)}
                    style={{ width: progress > 0 ? `${item.score}%` : '0%' }}
                  />
                </div>
                <p className="text-[12px] text-subtle font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Shared Interests */}
        <section className="fade-up space-y-4" style={{ animationDelay: '300ms' }}>
          <h3 className="text-[22px] font-bold text-ink px-1">Shared Interests</h3>
          <div className="flex flex-wrap gap-2.5">
            {[
              { name: "Python", color: "from-blue-500/10 to-blue-600/10 text-blue-600" },
              { name: "Azure", color: "from-sky-500/10 to-sky-600/10 text-sky-600" },
              { name: "Machine Learning", color: "from-purple-500/10 to-purple-600/10 text-purple-600" },
              { name: "Hackathons", color: "from-orange-500/10 to-orange-600/10 text-orange-600" },
              { name: "Cloud", color: "from-cyan-500/10 to-cyan-600/10 text-cyan-600" },
              { name: "Photography", color: "from-pink-500/10 to-pink-600/10 text-pink-600" },
              { name: "Chess", color: "from-slate-500/10 to-slate-600/10 text-slate-600" },
              { name: "Open Source", color: "from-emerald-500/10 to-emerald-600/10 text-emerald-600" },
            ].map((interest) => (
              <span 
                key={interest.name} 
                className={cn(
                  "rounded-full px-5 py-2 text-[14px] font-bold bg-gradient-to-br shadow-sm",
                  interest.color
                )}
              >
                {interest.name}
              </span>
            ))}
          </div>
        </section>

        {/* AI Strengths Card */}
        <section className="fade-up" style={{ animationDelay: '400ms' }}>
          <div className="rounded-[28px] bg-white border border-line/60 p-6 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.04)]">
            <h3 className="text-[19px] font-bold text-ink flex items-center gap-2">
              <Zap className="h-5 w-5 text-brand" />
              Why You Work Well Together
            </h3>
            <div className="mt-6 space-y-4">
              {[
                { label: "Similar Career Vision", icon: Target },
                { label: "Same Learning Style", icon: BrainCircuit },
                { label: "Strong Communication", icon: MessageCircle },
                { label: "Enjoy Team Projects", icon: Users },
                { label: "Similar Productivity Habits", icon: Rocket },
              ].map((strength) => (
                <div key={strength.label} className="flex items-center gap-3 py-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/5 text-brand">
                    <strength.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[16px] font-bold text-ink">✓ {strength.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Potential Differences */}
        <section className="fade-up" style={{ animationDelay: '500ms' }}>
          <div className="rounded-[28px] bg-[#F5F5F7] p-6 border border-line/40">
            <h3 className="text-[18px] font-bold text-ink flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-brand" />
              Areas That Make Your Team Stronger
            </h3>
            <p className="mt-4 text-[15px] leading-relaxed text-subtle font-medium">
              Sophia enjoys public speaking and presenting while you prefer strategic planning behind the scenes. These complementary strengths often create highly balanced project teams.
            </p>
          </div>
        </section>

        {/* Academic Profile */}
        <section className="fade-up space-y-4" style={{ animationDelay: '600ms' }}>
          <h3 className="text-[22px] font-bold text-ink px-1">Academic Profile</h3>
          <div className="rounded-[28px] bg-white border border-line/60 p-6 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.04)] space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[13px] font-bold text-subtle uppercase tracking-wider">Degree</p>
                <p className="text-[16px] font-bold text-ink mt-1">B.S. Comp Science</p>
              </div>
              <div>
                <p className="text-[13px] font-bold text-subtle uppercase tracking-wider">Year</p>
                <p className="text-[16px] font-bold text-ink mt-1">Junior (3rd Year)</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-[13px] font-bold text-subtle uppercase tracking-wider">Technical Skills</p>
                <p className="text-[15px] font-medium text-ink mt-1.5 leading-relaxed">
                  React, Node.js, Python, PostgreSQL, Azure, TensorFlow
                </p>
              </div>
              <div>
                <p className="text-[13px] font-bold text-subtle uppercase tracking-wider">Current Projects</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-8 w-8 rounded-lg bg-[#F5F5F7] flex items-center justify-center">
                    <Code2 className="h-4 w-4 text-brand" />
                  </div>
                  <p className="text-[15px] font-bold text-ink">AI Study Assistant App</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Project Interests */}
        <section className="fade-up space-y-4" style={{ animationDelay: '700ms' }}>
          <h3 className="text-[22px] font-bold text-ink px-1">Interested In</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Startup", icon: Rocket, color: "text-orange-500" },
              { label: "Hackathons", icon: Trophy, color: "text-brand" },
              { label: "Research", icon: BookOpen, color: "text-blue-500" },
              { label: "Open Source", icon: Code2, color: "text-emerald-500" },
            ].map((proj) => (
              <div key={proj.label} className="flex items-center gap-3 p-4 rounded-2xl border border-line bg-white shadow-sm">
                <proj.icon className={cn("h-5 w-5", proj.color)} />
                <span className="text-[15px] font-bold text-ink">{proj.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Mutual Communities */}
        <section className="fade-up space-y-4" style={{ animationDelay: '800ms' }}>
          <h3 className="text-[22px] font-bold text-ink px-1">Mutual Communities</h3>
          <div className="space-y-3">
            {[
              { name: "Azure Learners", members: "1.2k members" },
              { name: "AI Builders", members: "850 members" },
              { name: "Python Developers", members: "2.4k members" },
            ].map((comm) => (
              <div key={comm.name} className="flex items-center justify-between p-4 rounded-2xl bg-[#F5F5F7] border border-line/40">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center">
                    <Users className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <p className="text-[16px] font-bold text-ink">{comm.name}</p>
                    <p className="text-[12px] text-subtle font-medium">{comm.members}</p>
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-mint" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Conversation Starters */}
        <section className="fade-up space-y-4" style={{ animationDelay: '900ms' }}>
          <div className="rounded-[28px] border-2 border-brand/10 bg-brand/[0.02] p-6">
            <h3 className="text-[19px] font-bold text-ink flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-brand" />
              Suggested Ice Breakers
            </h3>
            <div className="mt-6 space-y-3">
              {[
                "Ask about their recent hackathon experience.",
                "Discuss Azure certification preparation.",
                "Share your favorite AI project.",
                "Talk about open-source contributions."
              ].map((starter, i) => (
                <button 
                  key={i}
                  className="w-full text-left p-4 rounded-2xl bg-white border border-brand/5 shadow-sm text-[15px] font-medium text-ink hover:border-brand/20 transition-all active:scale-[0.98]"
                >
                  "{starter}"
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="fade-up space-y-3 pt-4" style={{ animationDelay: '1000ms' }}>
          <button className="w-full h-[64px] rounded-2xl bg-gradient-to-r from-brand to-brand-deep text-[18px] font-bold text-white shadow-xl shadow-brand/20 transition-transform active:scale-[0.98]">
            Connect with Sophia
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button className="h-[56px] rounded-2xl border border-line bg-white text-[16px] font-bold text-ink transition-transform active:scale-[0.98] flex items-center justify-center gap-2">
              <MessageCircle className="h-5 w-5 text-subtle" />
              Message
            </button>
            <button className="h-[56px] rounded-2xl border border-line bg-white text-[16px] font-bold text-ink transition-transform active:scale-[0.98] flex items-center justify-center gap-2">
              <Bookmark className="h-5 w-5 text-subtle" />
              Save Profile
            </button>
          </div>
          <button className="w-full py-4 text-[14px] font-bold text-danger/60 flex items-center justify-center gap-2">
            <Flag className="h-4 w-4" />
            Report Profile
          </button>
        </div>
      </div>

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-50 px-6 pb-6 pt-2 bg-gradient-to-t from-white via-white to-transparent">
        <div className="flex h-16 items-center justify-between rounded-2xl bg-ink/95 backdrop-blur-md px-4 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] border border-white/10">
          {[
            { icon: Home, label: "Home", path: "/home", active: false },
            { icon: Users, label: "Matches", path: "/explore-matches", active: true },
            { icon: ClipboardList, label: "Quiz", path: "/questionnaire-hub", active: false },
            { icon: Globe, label: "Groups", path: "/home", active: false },
            { icon: User, label: "Profile", path: "/home", active: false },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                item.active ? "text-brand" : "text-white/40 hover:text-white/60"
              )}
            >
              <item.icon className={cn("h-5 w-5", item.active && "fill-brand/20")} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}