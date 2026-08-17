import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Bell, 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  Users, 
  Plus, 
  MessageSquare,
  TrendingUp,
  Activity,
  ChevronRight,
  Brain,
  Cloud,
  Code2,
  Rocket,
  FlaskConical,
  Briefcase,
  Home as HomeIcon,
  Heart,
  ClipboardList,
  User,
  Zap
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import match1 from "@/assets/match-1.jpg";
import match2 from "@/assets/match-2.jpg";
import match3 from "@/assets/match-3.jpg";

export const Route = createFileRoute("/communities")({
  head: () => ({
    meta: [
      { title: "Communities — Campus Connect AI" },
      {
        name: "description",
        content: "Discover AI-recommended student communities for learning, collaboration, and shared interests.",
      },
      { property: "og:title", content: "Communities — Campus Connect AI" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CommunitiesScreen,
});

const categories = [
  "All", "Technology", "Hackathons", "Study Groups", "AI", "Cloud", 
  "Programming", "Research", "Startups", "Networking", "Photography", 
  "Design", "Entrepreneurship"
];

const featuredCommunities = [
  {
    name: "AI Builders Hub",
    description: "Building the future with LLMs and AI agents. Weekly workshops and collab projects.",
    members: "1.2k members",
    activeCount: "42 active",
    icon: Brain,
    gradient: "from-brand to-brand-light",
    image: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Cloud Computing Club",
    description: "Master AWS, Azure & GCP. Dedicated study groups for certifications.",
    members: "850 members",
    activeCount: "18 active",
    icon: Cloud,
    gradient: "from-sky-400 to-blue-600",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Python Developers",
    description: "From beginner to advanced. Share code, get help, and build together.",
    members: "2.5k members",
    activeCount: "156 active",
    icon: Code2,
    gradient: "from-mint to-emerald-600",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop"
  }
];

const myCommunities = [
  { 
    name: "Data Science Squad", 
    unread: 3, 
    online: 12, 
    activity: "New notebook shared in #research", 
    active: true,
    icon: FlaskConical,
    gradient: "from-violet-400 to-fuchsia-500"
  },
  { 
    name: "Startup Founders", 
    unread: 0, 
    online: 8, 
    activity: "Pitch deck review tomorrow at 6 PM", 
    active: false,
    icon: Rocket,
    gradient: "from-amber-400 to-orange-500"
  }
];

const trending = [
  { 
    name: "Hackathon Community", 
    growth: "+25%", 
    members: "1,200 members", 
    topic: "AI Agents",
    gradient: "from-pink-400 to-rose-500"
  },
  { 
    name: "UI/UX Design Lab", 
    growth: "+18%", 
    members: "950 members", 
    topic: "Apple Design",
    gradient: "from-brand to-brand-light"
  }
];

const activityPosts = [
  {
    author: "Sara Williams",
    avatar: match2,
    content: "Just announced the Fall 2026 Hackathon! $5k in prizes up for grabs. Check the details in #announcements.",
    time: "2m ago",
    community: "Hackathon Community"
  },
  {
    author: "David Chen",
    avatar: match3,
    content: "Created a new study group for Advanced Algorithms. Meeting this Sunday at the Library.",
    time: "15m ago",
    community: "Study Groups"
  },
  {
    author: "James Wilson",
    avatar: match1,
    content: "Shared my notes for the Cloud Practitioner exam in the resources channel. Good luck everyone!",
    time: "1h ago",
    community: "Cloud Computing Club"
  }
];

function CommunitiesScreen() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] bg-white pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-[max(3.25rem,calc(env(safe-area-inset-top)+2.5rem))]">
      {/* Top Bar */}
      <header className="fade-up flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/20">
            <Zap className="h-6 w-6 fill-current" />
          </div>
          <span className="text-[22px] font-bold tracking-tight text-ink">Communities</span>
        </div>
        <button className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white ring-1 ring-border shadow-sm transition-transform active:scale-95">
          <Bell className="h-5 w-5 text-ink" />
          <span className="absolute right-3.5 top-3.5 h-2.5 w-2.5 animate-pulse rounded-full bg-danger ring-2 ring-white" />
        </button>
      </header>

      {/* Search Bar */}
      <div className="fade-up mt-8 px-6" style={{ animationDelay: "50ms" }}>
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-subtle" />
          <input 
            type="text" 
            placeholder="Search communities, technologies or interests..."
            className="h-[52px] w-full rounded-2xl bg-[#F5F5F7] pl-12 pr-12 text-[15px] outline-none ring-1 ring-transparent focus:ring-brand/20 transition-all placeholder:text-subtle"
          />
          <button className="absolute right-4 text-subtle hover:text-ink transition-colors">
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* AI Recommendation Card */}
      <section className="fade-up mt-8 px-6" style={{ animationDelay: "100ms" }}>
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-brand to-brand-deep p-6 text-white shadow-2xl shadow-brand/20">
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-[13px] font-bold tracking-wider uppercase opacity-90">AI Powered</span>
            </div>
            <h2 className="mt-4 text-[24px] font-bold leading-tight">Communities Recommended For You ✨</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-white/80">
              Based on your profile, we found communities that match your interests, learning style and career goals.
            </p>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-[15px] font-semibold text-white/90">12 Recommended Communities</span>
              <Link 
                to="/explore-matches"
                className="flex h-11 items-center justify-center rounded-xl bg-white px-5 text-[15px] font-bold text-brand shadow-lg transition-transform active:scale-95"
              >
                Explore Now
              </Link>
            </div>
          </div>
          {/* Decorative shapes */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-brand-light/20 blur-2xl" />
        </div>
      </section>

      {/* Category Chips */}
      <div className="fade-up mt-8" style={{ animationDelay: "150ms" }}>
        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex h-10 shrink-0 snap-start items-center rounded-full px-5 text-[14px] font-semibold transition-all ${
                selectedCategory === cat 
                  ? "bg-brand text-white shadow-lg shadow-brand/20" 
                  : "bg-[#F5F5F7] text-subtle hover:bg-line"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Communities */}
      <section className="fade-up mt-10" style={{ animationDelay: "200ms" }}>
        <h2 className="px-6 text-[22px] font-bold text-ink">Featured Communities</h2>
        <div className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featuredCommunities.map((comm) => (
            <div key={comm.name} className="relative w-[280px] shrink-0 snap-start overflow-hidden rounded-[24px] border border-border/50 bg-white shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)]">
              <div className="relative h-32 overflow-hidden">
                <img src={comm.image} alt={comm.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className={`absolute bottom-3 left-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${comm.gradient} shadow-lg ring-2 ring-white`}>
                  <comm.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-[17px] font-bold text-ink">{comm.name}</h3>
                <p className="mt-1 line-clamp-2 min-h-[40px] text-[14px] leading-relaxed text-subtle">{comm.description}</p>
                <div className="mt-4 flex items-center justify-between text-[13px] text-subtle">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Users className="h-3.5 w-3.5" />
                    {comm.members}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-mint">
                    <Activity className="h-3.5 w-3.5" />
                    {comm.activeCount}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => toast.success(`Request to join ${comm.name} sent!`)}
                    className="flex h-10 items-center justify-center rounded-xl bg-brand text-[14px] font-bold text-white shadow-lg shadow-brand/10 transition-transform active:scale-95"
                  >
                    Join
                  </button>
                  <button 
                    onClick={() => toast.info(`Previewing ${comm.name}...`)}
                    className="flex h-10 items-center justify-center rounded-xl bg-[#F5F5F7] text-[14px] font-bold text-ink transition-transform active:scale-95"
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* My Communities */}
      <section className="fade-up mt-10 px-6" style={{ animationDelay: "250ms" }}>
        <h2 className="text-[22px] font-bold text-ink">Your Communities</h2>
        <div className="mt-5 space-y-4">
          {myCommunities.map((comm) => (
            <div key={comm.name} className="flex items-center gap-4 rounded-3xl border border-border/40 bg-white p-4 shadow-[0_12px_24px_-12px_rgba(0,0,0,0.08)]">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${comm.gradient} shadow-lg shadow-brand/5`}>
                <comm.icon className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="truncate text-[16px] font-bold text-ink">{comm.name}</h3>
                  {comm.unread > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">
                      {comm.unread}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${comm.active ? "bg-success" : "bg-slate-300"}`} />
                  <span className="text-[13px] font-medium text-subtle">{comm.online} members online</span>
                </div>
                <p className="mt-1.5 truncate text-[13px] text-subtle italic">"{comm.activity}"</p>
              </div>
              <ChevronRight className="h-5 w-5 text-border" />
            </div>
          ))}
        </div>
      </section>

      {/* Trending Communities */}
      <section className="fade-up mt-10" style={{ animationDelay: "300ms" }}>
        <div className="flex items-center justify-between px-6">
          <h2 className="text-[22px] font-bold text-ink">Trending This Week 🔥</h2>
          <button onClick={() => toast.info("Showing all trending communities...")} className="text-[14px] font-bold text-brand">See All</button>
        </div>
        <div className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {trending.map((comm) => (
            <div key={comm.name} className="w-[200px] shrink-0 snap-start rounded-[24px] border border-border/40 bg-white p-5 shadow-[0_15px_30px_-15px_rgba(0,0,0,0.08)]">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${comm.gradient} shadow-md`}>
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <span className="text-[13px] font-bold text-success">{comm.growth}</span>
              </div>
              <h3 className="mt-4 truncate text-[16px] font-bold text-ink">{comm.name}</h3>
              <p className="mt-1 text-[13px] font-medium text-subtle">{comm.members}</p>
              <div className="mt-4 flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-subtle/70">Popular Topic</span>
                <span className="text-[14px] font-bold text-ink">{comm.topic}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Community Activity Preview */}
      <section className="fade-up mt-10 px-6" style={{ animationDelay: "350ms" }}>
        <h2 className="text-[22px] font-bold text-ink">Recent Activity</h2>
        <div className="mt-5 rounded-[28px] border border-border/40 bg-[#F5F5F7]/50 p-6">
          <div className="space-y-6">
            {activityPosts.map((post, idx) => (
              <div key={idx} className="flex gap-4">
                <img src={post.avatar} alt={post.author} className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[15px] font-bold text-ink">{post.author}</span>
                    <span className="shrink-0 text-[12px] text-subtle">{post.time}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1">
                    <MessageSquare className="h-3 w-3 text-brand" />
                    <span className="truncate text-[12px] font-semibold text-brand">{post.community}</span>
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink/80">{post.content}</p>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => toast.info("Opening full activity feed...")}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-[15px] font-bold text-ink shadow-sm transition-transform active:scale-[0.98]"
          >
            View All Activity
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Create Button FAB */}
      <button 
        onClick={() => toast.success("Create community feature coming soon!")}
        className="fixed bottom-[max(6.5rem,calc(env(safe-area-inset-bottom)+5.5rem))] right-6 z-20 flex items-center gap-2 rounded-full bg-brand px-6 py-4 text-white shadow-xl shadow-brand/30 transition-transform active:scale-95"
      >
        <Plus className="h-6 w-6" />
        <span className="text-[16px] font-bold">Create</span>
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[520px] px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between rounded-[22px] border border-border/40 bg-white px-3 py-2 shadow-[0_20px_44px_-22px_rgba(18,18,18,0.2)]">
          {[
            { label: "Home", icon: HomeIcon, path: "/home", active: false },
            { label: "Matches", icon: Heart, path: "/explore-matches", active: false },
            { label: "Communities", icon: Users, path: "/communities", active: true },
            { label: "Chat", icon: MessageSquare, path: "/chat", active: false },
            { label: "Profile", icon: User, path: "/my-profile", active: false },
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
