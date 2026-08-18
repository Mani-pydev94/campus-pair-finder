import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Share2,
  Edit3,
  MapPin,
  GraduationCap,
  BookOpen,
  Trophy,
  Users,
  Home,
  Heart,
  MessageSquare,
  User,
  Settings,
  ChevronRight,
  Code2,
  Award,
  BarChart3,
  Layers,
  Sparkles,
  ExternalLink,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/my-profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Campus Connect AI" },
      {
        name: "description",
        content: "View and manage your personal student profile, academic information, and AI insights.",
      },
    ],
  }),
  component: MyProfileScreen,
});

function MyProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [academic, setAcademic] = useState<any>(null);
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          const { data: acad } = await supabase.from('academic_profiles').select('*').eq('id', session.user.id).single();
          
          setProfile(prof);
          setAcademic(acad);

          // Calculate completion percentage
          let points = 0;
          if (prof?.display_name) points += 10;
          if (prof?.avatar_url) points += 15;
          if (prof?.bio) points += 15;
          if (prof?.city) points += 5;
          if (acad?.university) points += 15;
          if (acad?.degree) points += 15;
          if (acad?.skills?.length) points += 15;
          if (acad?.interests?.length) points += 10;
          
          setCompletion(Math.min(points, 100));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 text-brand animate-spin" />
      </div>
    );
  }

  const name = profile?.display_name || "Alex Chen";
  const university = academic?.university || "Massachusetts Institute of Technology";
  const degree = academic?.degree || "B.S. Computer Science & Engineering";
  const avatar = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-[#F8F9FB] pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.05] px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => router.history.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary transition-transform active:scale-90"
        >
          <ArrowLeft className="h-5 w-5 text-ink" />
        </button>
        <h1 className="text-[17px] font-bold tracking-tight text-ink">My Profile</h1>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary transition-transform active:scale-90">
          <Settings className="h-5 w-5 text-ink" />
        </button>
      </header>

      <main className="flex-1 space-y-4 px-4 mt-4">
        {/* Profile Hero Card */}
        <section className="fade-up overflow-hidden rounded-[32px] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02]">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="h-28 w-28 overflow-hidden rounded-[28px] border-4 border-brand/5 shadow-xl ring-4 ring-white">
                <img src={avatar} alt={name} className="h-full w-full object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white shadow-lg border-2 border-white">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
            </div>
            
            <div className="mt-5 space-y-1">
              <h2 className="text-[26px] font-bold tracking-tight text-ink">{name}</h2>
              <p className="text-[15px] font-semibold text-brand">{university}</p>
              <p className="text-[14px] font-medium text-subtle">{degree}</p>
            </div>

            {/* Profile Completion */}
            <div className="mt-6 w-full space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[12px] font-bold uppercase tracking-wider text-subtle/70">Profile Strength</span>
                <span className="text-[13px] font-bold text-brand">{completion}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/50">
                <div 
                  className="h-full bg-brand transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="mt-8 grid w-full grid-cols-2 gap-3">
              <Link 
                to="/edit-profile"
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand text-[15px] font-bold text-white shadow-lg shadow-brand/10 transition-transform active:scale-[0.97]"
              >
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </Link>
              <button 
                onClick={() => toast.success("Profile link copied to clipboard!")}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-secondary text-[15px] font-bold text-ink transition-transform active:scale-[0.97]"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>
        </section>

        {/* Statistics Cards */}
        <section className="fade-up grid grid-cols-2 gap-3" style={{ animationDelay: '100ms' }}>
          {[
            { label: "Matches", value: "84", icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
            { label: "Communities", value: "12", icon: Users, color: "text-brand", bg: "bg-brand/5" },
            { label: "Connections", value: "142", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Profile Views", value: "4.2k", icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-50" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-[24px] bg-white p-4 border border-black/[0.02] shadow-sm">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl mb-3", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <p className="text-[20px] font-bold text-ink leading-tight">{stat.value}</p>
              <p className="text-[13px] font-semibold text-subtle/80 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Detailed Sections */}
        <div className="fade-up space-y-3 pb-8" style={{ animationDelay: '200ms' }}>
          {/* About Me */}
          <section className="rounded-[24px] bg-white p-6 border border-black/[0.02] shadow-sm">
            <h3 className="text-[18px] font-bold text-ink mb-3">About Me</h3>
            <p className="text-[15px] leading-relaxed text-subtle font-medium">
              {profile?.bio || "Passionate about full-stack development, AI, and building sustainable technology. Currently focused on collaborative learning and hackathons."}
            </p>
          </section>

          {/* Academic Information */}
          <section className="rounded-[24px] bg-white p-6 border border-black/[0.02] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-ink">Academic Information</h3>
              <GraduationCap className="h-5 w-5 text-brand" />
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-secondary flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-ink/70" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-ink">{university}</p>
                  <p className="text-[13px] font-medium text-subtle">{degree}</p>
                  <p className="text-[12px] font-bold text-brand mt-1">Expected Graduation: 2027</p>
                </div>
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="rounded-[24px] bg-white p-6 border border-black/[0.02] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-ink">Skills</h3>
              <Code2 className="h-5 w-5 text-brand" />
            </div>
            <div className="flex flex-wrap gap-2">
              {(academic?.skills || ["React", "TypeScript", "Python", "Node.js", "AI/ML", "Figma", "AWS"]).map((skill: string) => (
                <span key={skill} className="px-4 py-2 rounded-full bg-secondary text-[13px] font-bold text-ink/80">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Interests */}
          <section className="rounded-[24px] bg-white p-6 border border-black/[0.02] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-ink">Interests</h3>
              <Heart className="h-5 w-5 text-rose-500" />
            </div>
            <div className="flex flex-wrap gap-2">
              {(academic?.interests || ["Open Source", "Hackathons", "Blockchain", "Green Tech", "Photography", "Chess"]).map((interest: string) => (
                <span key={interest} className="px-4 py-2 rounded-full bg-secondary text-[13px] font-bold text-ink/80">
                  {interest}
                </span>
              ))}
            </div>
          </section>

          {/* Communities */}
          <section className="rounded-[24px] bg-white p-6 border border-black/[0.02] shadow-sm">
            <h3 className="text-[18px] font-bold text-ink mb-4">Communities</h3>
            <div className="space-y-3">
              {[
                { name: "MIT AI Lab", role: "Researcher", members: "452 members" },
                { name: "Full Stack Builders", role: "Contributor", members: "1.2k members" },
              ].map((comm) => (
                <div key={comm.name} className="flex items-center justify-between p-3 rounded-2xl bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center">
                      <Users className="h-5 w-5 text-brand" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-ink">{comm.name}</p>
                      <p className="text-[12px] font-medium text-subtle">{comm.role} · {comm.members}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-subtle" />
                </div>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section className="rounded-[24px] bg-white p-6 border border-black/[0.02] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-ink">Projects</h3>
              <Layers className="h-5 w-5 text-brand" />
            </div>
            <div className="space-y-4">
              {[
                { name: "EcoTrack AI", desc: "AI-powered carbon footprint tracker for students.", status: "Live" },
                { name: "CampusMeet", desc: "Collaborative event planning platform for campus clubs.", status: "Development" },
              ].map((proj) => (
                <div key={proj.name} className="p-4 rounded-2xl border border-black/[0.03] bg-[#FDFDFF]">
                  <div className="flex items-center justify-between">
                    <p className="text-[16px] font-bold text-ink">{proj.name}</p>
                    <span className="px-2 py-0.5 rounded-lg bg-brand/10 text-[10px] font-black uppercase text-brand tracking-tighter">
                      {proj.status}
                    </span>
                  </div>
                  <p className="text-[14px] font-medium text-subtle mt-1.5">{proj.desc}</p>
                  <button className="flex items-center gap-1.5 text-[12px] font-bold text-brand mt-3 transition-opacity active:opacity-60">
                    View Project <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Certifications */}
          <section className="rounded-[24px] bg-white p-6 border border-black/[0.02] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-ink">Certifications</h3>
              <Award className="h-5 w-5 text-brand" />
            </div>
            <div className="space-y-3">
              {[
                { name: "Google Data Analytics", issuer: "Google", date: "Jan 2026" },
                { name: "Azure Solutions Architect", issuer: "Microsoft", date: "Nov 2025" },
              ].map((cert) => (
                <div key={cert.name} className="flex items-center gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-secondary flex items-center justify-center">
                    <Award className="h-5 w-5 text-ink/70" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-ink">{cert.name}</p>
                    <p className="text-[13px] font-medium text-subtle">{cert.issuer} · {cert.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1 bg-white/80 backdrop-blur-xl border-t border-black/[0.05]">
        <div className="flex items-center justify-between gap-1 h-14">
          {[
            { label: "Home", icon: Home, path: "/home", active: false },
            { label: "Matches", icon: Heart, path: "/explore-matches", active: false },
            { label: "Communities", icon: Users, path: "/communities", active: false },
            { label: "Chat", icon: MessageSquare, path: "/chat", active: false },
            { label: "Profile", icon: User, path: "/my-profile", active: true },
          ].map(({ label, icon: Icon, path, active }) => (
            <Link
              key={label}
              to={path}
              className="group flex flex-1 flex-col items-center gap-1 transition-transform active:scale-90"
            >
              <div className={cn(
                "flex h-10 w-12 items-center justify-center rounded-2xl transition-all duration-300",
                active ? "bg-brand text-white shadow-lg shadow-brand/20 scale-105" : "text-subtle group-hover:bg-secondary group-hover:text-ink"
              )}>
                <Icon className={cn("h-[22px] w-[22px]", active ? "stroke-[2.5px]" : "stroke-[2px]")} />
              </div>
              <span className={cn(
                "text-[10px] font-bold tracking-tight transition-colors duration-300",
                active ? "text-brand" : "text-subtle"
              )}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}