import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { 
  ArrowLeft, 
  Sliders, 
  Search, 
  Mic, 
  Bookmark, 
  Sparkles,
  Info,
  CheckCircle2,
  Home,
  Users,
  ClipboardList,
  Globe,
  User,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

// Import assets
import student1 from "@/assets/matches/student-1.jpg";
import student2 from "@/assets/matches/student-2.jpg";
import student3 from "@/assets/matches/student-3.jpg";
import student4 from "@/assets/matches/student-4.jpg";

export const Route = createFileRoute("/explore-matches")({
  head: () => ({
    meta: [
      { title: "Explore Matches — Campus Connect AI" },
      {
        name: "description",
        content: "Discover AI-powered student collaborations personalized for your goals and personality.",
      },
      { property: "og:title", content: "Explore Matches — Campus Connect AI" },
      {
        property: "og:description",
        content: "Discover AI-powered student collaborations personalized for your goals and personality.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExploreMatchesScreen,
});

const filterCategories = [
  "All",
  "Study Partner",
  "Project Team",
  "Hackathon",
  "Placement Prep",
  "Startup",
  "Networking",
  "Research",
  "Friends",
];

const matches = [
  {
    id: 1,
    name: "Sarah Chen",
    age: 21,
    college: "Stanford University",
    course: "Computer Science",
    city: "Palo Alto",
    image: student1,
    score: 96,
    tags: ["Study Buddy", "Hackathon", "Python"],
    insight: "You both enjoy collaborative learning and have similar career goals in Cloud Computing.",
    reasons: ["Similar Values", "Same Learning Style", "Great Communication Match"]
  },
  {
    id: 2,
    name: "Marcus Miller",
    age: 22,
    college: "MIT",
    course: "Business Administration",
    city: "Boston",
    image: student2,
    score: 92,
    tags: ["Startup", "Networking", "FinTech"],
    insight: "Your expertise in development perfectly complements Marcus's business strategy background for potential startups.",
    reasons: ["Complementary Skills", "Goal Alignment", "Work Ethic Match"]
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    age: 20,
    college: "UC Berkeley",
    course: "Data Science",
    city: "Berkeley",
    image: student3,
    score: 88,
    tags: ["Research", "AI Enthusiast", "Python"],
    insight: "Elena is currently researching LLMs, which aligns with your interest in AI-powered applications.",
    reasons: ["Shared Interests", "Active Learner", "Similar Research Goals"]
  },
  {
    id: 4,
    name: "James Wilson",
    age: 22,
    college: "Harvard University",
    course: "Applied Math",
    city: "Cambridge",
    image: student4,
    score: 75,
    tags: ["Placement Prep", "Cloud Computing", "Math"],
    insight: "While you have different backgrounds, you both are currently focusing on Azure Certification preparation.",
    reasons: ["Niche Skill Overlap", "Mutual Career Goal", "Study Schedule Sync"]
  }
];

function ExploreMatchesScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarked, setBookmarked] = useState<number[]>([]);

  const toggleBookmark = (id: number) => {
    setBookmarked(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-white pb-[max(5rem,env(safe-area-inset-bottom)+1.5rem)] pt-[max(1rem,env(safe-area-inset-top))]">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => router.history.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white transition-transform active:scale-95"
        >
          <ArrowLeft className="h-5 w-5 text-ink" />
        </button>
        <h1 className="text-[17px] font-bold tracking-tight text-ink">Explore Matches</h1>
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white shadow-sm transition-transform active:scale-95">
          <Sliders className="h-4 w-4 text-ink" />
        </button>
      </header>

      <div className="px-6 space-y-6 mt-2">
        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle transition-colors group-focus-within:text-brand">
            <Search className="h-5 w-5" />
          </div>
          <input 
            type="text"
            placeholder="Search by name, skill, interest or college..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-[52px] w-full rounded-2xl bg-[#F5F5F7] pl-12 pr-12 text-[15px] text-ink outline-none border border-transparent transition-all focus:bg-white focus:border-brand/20 focus:shadow-[0_4px_20px_-4px_rgba(109,94,247,0.1)]"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-subtle">
            <Mic className="h-5 w-5" />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar -mx-6 px-6">
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={cn(
                "whitespace-nowrap rounded-full px-5 py-2.5 text-[14px] font-semibold transition-all active:scale-95",
                activeFilter === cat 
                  ? "bg-brand text-white shadow-md shadow-brand/20" 
                  : "bg-white border border-line text-subtle hover:border-brand/40"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Match Count */}
        <div>
          <h2 className="text-[15px] font-bold text-ink">124 Compatible Students Found</h2>
          <p className="text-[13px] text-subtle mt-0.5">Sorted by AI Compatibility</p>
        </div>

        {/* Match List */}
        <div className="space-y-6">
          {matches.map((match, idx) => (
            <div 
              key={match.id}
              className="fade-up rounded-[28px] bg-white border border-line/60 p-5 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.06)] group"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Header Info */}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-brand/10 group-hover:scale-105 transition-transform duration-500">
                    <img src={match.image} alt={match.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white shadow-md border-2 border-white">
                    {match.score}%
                  </div>
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[18px] font-bold text-ink truncate">{match.name}, {match.age}</h3>
                  </div>
                  <p className="text-[14px] font-medium text-subtle truncate">{match.college}</p>
                  <p className="text-[13px] text-subtle truncate">{match.course} • {match.city}</p>
                </div>
              </div>

              {/* Purpose Tags */}
              <div className="flex flex-wrap gap-1.5 mt-5">
                {match.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#F5F5F7] px-3 py-1 text-[11px] font-bold text-subtle uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>

              {/* AI Insight Card */}
              <div className="mt-5 rounded-2xl bg-brand/[0.03] border border-brand/5 p-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand/40" />
                <div className="flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                  <p className="text-[14px] leading-[1.6] text-ink font-medium">
                    {match.insight}
                  </p>
                </div>
              </div>

              {/* Match Reasons */}
              <div className="flex flex-wrap gap-2 mt-4">
                {match.reasons.map((reason) => (
                  <div key={reason} className="flex items-center gap-1.5 rounded-full bg-mint/10 px-3 py-1.5 text-[12px] font-semibold text-mint-deep">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {reason}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-6">
                <button className="flex-1 h-[52px] rounded-2xl bg-brand text-[16px] font-bold text-white shadow-lg shadow-brand/20 transition-all active:scale-95">
                  View Profile
                </button>
                <button 
                  onClick={() => toggleBookmark(match.id)}
                  className={cn(
                    "flex h-[52px] w-[52px] items-center justify-center rounded-2xl border transition-all active:scale-95",
                    bookmarked.includes(match.id) 
                      ? "bg-brand/10 border-brand text-brand" 
                      : "bg-white border-line text-subtle"
                  )}
                >
                  <Bookmark className={cn("h-5 w-5", bookmarked.includes(match.id) && "fill-brand")} />
                </button>
                <button className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-line bg-white text-subtle transition-all active:scale-95">
                  <ExternalLink className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* AI Match Score Legend */}
        <div className="rounded-[28px] bg-[#F5F5F7] p-6 border border-line/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand shadow-sm">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-ink">How Match Scores Work</h3>
              <p className="text-[13px] text-subtle mt-0.5">Calculated by Campus Connect AI</p>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-line/50">
              <span className="text-[14px] font-bold text-brand">90–100%</span>
              <span className="text-[14px] font-semibold text-ink">Excellent Match</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-line/50">
              <span className="text-[14px] font-bold text-emerald-500">80–89%</span>
              <span className="text-[14px] font-semibold text-ink">Strong Match</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-line/50">
              <span className="text-[14px] font-bold text-orange-400">70–79%</span>
              <span className="text-[14px] font-semibold text-ink">Good Match</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[14px] font-bold text-subtle">Below 70%</span>
              <span className="text-[14px] font-semibold text-ink">Different Perspectives</span>
            </div>
          </div>
          
          <p className="mt-5 text-[13px] leading-relaxed text-subtle">
            High percentages indicate similar ways of thinking, while lower scores suggest diverse perspectives which can also create highly successful teams.
          </p>
        </div>

        {/* Smart Suggestions */}
        <div className="rounded-[28px] bg-gradient-to-br from-brand/90 to-brand-deep p-6 text-white relative overflow-hidden shadow-xl shadow-brand/10">
          <Sparkles className="absolute -right-4 -top-4 h-32 w-32 text-white/10 rotate-12" aria-hidden />
          <h3 className="text-[20px] font-bold">Recommended For You</h3>
          <p className="mt-2 text-[15px] font-medium text-white/80 leading-relaxed">
            Students preparing for Azure Certification are active now.
          </p>
          <button className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-[15px] font-bold text-brand transition-all active:scale-95">
            Explore Group
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-24 right-6 flex items-center gap-2 rounded-full bg-brand p-4 px-6 text-white shadow-[0_12px_24px_-8px_rgba(109,94,247,0.5)] transition-transform active:scale-95 z-50">
        <Sparkles className="h-5 w-5 fill-white" />
        <span className="text-[15px] font-bold tracking-tight">Ask AI</span>
      </button>

      {/* Bottom Navigation */}
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
