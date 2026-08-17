import { createFileRoute, Link, useRouter, Outlet } from "@tanstack/react-router";
import { 
  ArrowLeft, 
  Search, 
  MoreHorizontal, 
  Sparkles, 
  Plus, 
  MessageSquare,
  Video,
  Phone,
  Monitor,
  FileText,
  ChevronRight,
  Brain,
  Cloud,
  Code2,
  Rocket,
  Home as HomeIcon,
  Heart,
  Users,
  ClipboardList,
  User,
  CheckCheck
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import student1 from "@/assets/match-1.jpg";
import student2 from "@/assets/match-2.jpg";
import student3 from "@/assets/match-3.jpg";


export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat — Campus Connect AI" },
      {
        name: "description",
        content: "Collaborate with your AI matches and communities through premium private and group chats.",
      },
    ],
  }),
});

const pinnedChats = [
  { name: "Sophia", score: 96, avatar: student1, online: true },
  { name: "Ryan", score: 94, avatar: student3, online: true },
  { name: "Emma", score: 92, avatar: student2, online: false },
];

const privateChats = [
  {
    name: "Sophia Johnson",
    message: "Working on the Azure project this weekend?",
    time: "2m ago",
    unread: 3,
    online: true,
    score: 96,
    avatar: student1
  },
  {
    name: "Marcus Miller",
    message: "The AI agent logic looks solid. Let's push to main.",
    time: "15m ago",
    unread: 0,
    online: true,
    score: 92,
    avatar: student3
  },
  {
    name: "Ananya Reddy",
    message: "Can you review my React component for the hub?",
    time: "1h ago",
    unread: 0,
    online: false,
    score: 89,
    avatar: student2
  }
];

const groupChats = [
  {
    name: "AI Builders Hub",
    message: "James: New hackathon announced in #announcements",
    participants: 1200,
    active: 42,
    unread: 12,
    icon: Brain,
    gradient: "from-brand to-brand-light"
  },
  {
    name: "Cloud Computing Club",
    message: "Sarah: Who's up for a study session tomorrow?",
    participants: 850,
    active: 18,
    unread: 0,
    icon: Cloud,
    gradient: "from-sky-400 to-blue-600"
  },
  {
    name: "Startup Founders",
    message: "You: Shared the pitch deck in resources",
    participants: 450,
    active: 8,
    unread: 0,
    icon: Rocket,
    gradient: "from-amber-400 to-orange-500"
  }
];

const sharedFiles = [
  { name: "Project Proposal.pdf", size: "2.4 MB", type: "PDF" },
  { name: "Azure Notes.docx", size: "1.1 MB", type: "DOCX" },
  { name: "ML Resources.pdf", size: "5.8 MB", type: "PDF" }
];

const conversation = [
  { sender: "Sophia", text: "Are you interested in participating in the hackathon next month?", type: "incoming" },
  { sender: "You", text: "Yes. I'm preparing for the Azure challenge as well.", type: "outgoing" },
  { sender: "Sophia", text: "Great. Let's create a team.", type: "incoming" }
];

function ChatScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"private" | "group">("private");
  const [showNewChatFlow, setShowNewChatFlow] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMatches = useMemo(() => {
    const all = [...pinnedChats, ...privateChats];
    if (!searchQuery) return all;
    return all.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  useEffect(() => {
    console.log("showNewChatFlow state:", showNewChatFlow);
  }, [showNewChatFlow]);


  if (showNewChatFlow) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-[520px] bg-white pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[max(1.5rem,calc(env(safe-area-inset-top)+1.5rem))]">
        <header className="flex items-center justify-between px-6">
          <button 
            onClick={() => setShowNewChatFlow(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-border shadow-sm transition-transform active:scale-90"
          >
            <ArrowLeft className="h-5 w-5 text-ink" />
          </button>
          <h1 className="text-[20px] font-bold tracking-tight text-ink">New Message</h1>
          <div className="w-10" />
        </header>

        <div className="mt-6 px-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input 
              type="text" 
              placeholder="Search matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-2xl bg-secondary/30 pl-11 pr-4 text-[15px] outline-none transition-all focus:bg-secondary/50 focus:ring-1 focus:ring-brand/20"
              autoFocus
            />
          </div>
        </div>

        <div className="mt-8 px-6">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-subtle">Suggested</h2>
          <div className="mt-4 space-y-4">
            {filteredMatches.map((match, i) => (
              <button 
                key={`${match.name}-${i}`}
                onClick={() => {
                  toast.success(`Starting conversation with ${match.name}`);
                  setShowNewChatFlow(false);
                }}
                className="flex w-full items-center gap-4 rounded-2xl p-2 transition-all active:scale-[0.98] active:bg-secondary/40"
              >
                <div className="relative">
                  <img src={match.avatar} alt={match.name} className="h-12 w-12 rounded-2xl object-cover shadow-sm" />
                  {('online' in match && match.online) && (
                    <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-success" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-[16px] font-bold text-ink">{match.name}</p>
                  <p className="text-[12px] font-medium text-brand">{match.score}% Match Compatibility</p>
                </div>
                <ChevronRight className="ml-auto h-5 w-5 text-border" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] bg-white pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-[max(1.5rem,calc(env(safe-area-inset-top)+1.5rem))]">
      {/* State Debug */}
      <div className="hidden">{showNewChatFlow ? "OPEN" : "CLOSED"}</div>
      
      {/* Top Bar */}
      <header className="fade-up flex items-center justify-between px-6">
        <button 
          onClick={() => router.history.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-border shadow-sm transition-transform active:scale-90"
        >
          <ArrowLeft className="h-5 w-5 text-ink" />
        </button>
        <h1 className="text-[22px] font-bold tracking-tight text-ink">Chat</h1>
        <div className="flex items-center gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-border shadow-sm transition-transform active:scale-90">
            <Search className="h-5 w-5 text-ink" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-border shadow-sm transition-transform active:scale-90">
            <MoreHorizontal className="h-5 w-5 text-ink" />
          </button>
        </div>
      </header>

      {/* Segmented Control */}
      <div className="fade-up mt-8 px-6" style={{ animationDelay: "50ms" }}>
        <div className="relative flex rounded-2xl bg-secondary/40 p-1">
          <div 
            className={cn(
              "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-[14px] bg-brand shadow-md transition-all duration-300 ease-out",
              activeTab === "group" ? "translate-x-full" : "translate-x-0"
            )}
          />
          <button 
            onClick={() => setActiveTab("private")}
            className={cn(
              "relative z-10 flex-1 py-3 text-[15px] font-bold transition-colors",
              activeTab === "private" ? "text-white" : "text-subtle"
            )}
          >
            Private Chats
          </button>
          <button 
            onClick={() => setActiveTab("group")}
            className={cn(
              "relative z-10 flex-1 py-3 text-[15px] font-bold transition-colors",
              activeTab === "group" ? "text-white" : "text-subtle"
            )}
          >
            Group Chats
          </button>
        </div>
      </div>

      {/* Pinned Conversations */}
      <section className="fade-up mt-9" style={{ animationDelay: "100ms" }}>
        <h2 className="px-6 text-[18px] font-bold text-ink">Pinned Chats</h2>
        <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {pinnedChats.map((chat) => (
            <div key={chat.name} className="flex w-20 shrink-0 snap-start flex-col items-center gap-2">
              <div className="relative">
                <div className="h-20 w-20 overflow-hidden rounded-3xl ring-2 ring-brand/10 transition-transform active:scale-95">
                  <img src={chat.avatar} alt={chat.name} className="h-full w-full object-cover" />
                </div>
                {chat.online && (
                  <span className="absolute -right-1 -top-1 h-5 w-5 animate-pulse rounded-full border-4 border-white bg-success" />
                )}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white shadow-sm ring-1 ring-white">
                  {chat.score}% Match
                </div>
              </div>
              <span className="mt-1 text-[13px] font-bold text-ink">{chat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Main List */}
      <section className="fade-up mt-9 px-6" style={{ animationDelay: "150ms" }}>
        <h2 className="text-[18px] font-bold text-ink">
          {activeTab === "private" ? "Recent Conversations" : "Community Discussions"}
        </h2>
        <div className="mt-5 space-y-4">
          {(activeTab === "private" ? privateChats : groupChats).map((chat, idx) => (
            <div 
              key={chat.name} 
              className="group flex items-center gap-4 rounded-[24px] border border-border/40 bg-white p-4 shadow-[0_12px_24px_-12px_rgba(0,0,0,0.06)] transition-all active:scale-[0.98] active:bg-secondary/20"
            >
              <div className="relative shrink-0">
                {"avatar" in chat ? (
                  <img src={chat.avatar} alt={chat.name} className="h-14 w-14 rounded-2xl object-cover" />
                ) : (
                  <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", chat.gradient)}>
                    {chat.icon && <chat.icon className="h-7 w-7" />}
                  </div>
                )}
                {"online" in chat && chat.online && (
                  <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-success" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="truncate text-[16px] font-bold text-ink">{chat.name}</h3>
                    {"score" in chat && (
                      <span className="shrink-0 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand uppercase tracking-wider">
                        {chat.score}% Match
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] font-medium text-subtle">
                    {"time" in chat ? chat.time : `${chat.active} online`}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-4">
                  <p className="truncate text-[14px] text-subtle leading-tight">
                    {chat.message}
                  </p>
                  {chat.unread > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white shadow-lg shadow-brand/20">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Conversation Starters */}
      <section className="fade-up mt-10 px-6" style={{ animationDelay: "200ms" }}>
        <div className="rounded-[28px] bg-gradient-to-br from-brand via-brand to-brand-deep p-6 text-white shadow-xl shadow-brand/20">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-[17px] font-bold">AI Conversation Starters ✨</h3>
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-white/80">
            Break the ice with these AI-generated suggestions based on shared interests.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "Ask about their latest project",
              "Discuss upcoming certifications",
              "Talk about hackathons",
              "Share your learning goals"
            ].map((tag) => (
              <button key={tag} className="rounded-xl bg-white/15 px-4 py-2 text-[13px] font-bold text-white backdrop-blur-sm transition-transform active:scale-95">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Chat Window Preview */}
      <section className="fade-up mt-10 px-6" style={{ animationDelay: "250ms" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-bold text-ink">Active Chat</h2>
          <div className="flex items-center gap-3">
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/40 text-subtle transition-transform active:scale-90">
              <Phone className="h-4 w-4" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/40 text-subtle transition-transform active:scale-90">
              <Video className="h-4 w-4" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/40 text-subtle transition-transform active:scale-90">
              <Monitor className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4 rounded-[32px] border border-border/40 bg-secondary/20 p-6">
          <div className="flex flex-col gap-4">
            {conversation.map((msg, i) => (
              <div 
                key={i} 
                className={cn(
                  "max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-500",
                  msg.type === "outgoing" ? "self-end" : "self-start"
                )}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {msg.type === "incoming" && (
                  <span className="mb-1 ml-3 block text-[11px] font-bold text-subtle">{msg.sender}</span>
                )}
                <div 
                  className={cn(
                    "rounded-[24px] px-5 py-3.5 text-[15px] leading-relaxed shadow-sm",
                    msg.type === "outgoing" 
                      ? "rounded-tr-md bg-brand text-white" 
                      : "rounded-tl-md bg-white text-ink"
                  )}
                >
                  {msg.text}
                </div>
                {msg.type === "outgoing" && (
                  <div className="mt-1 flex items-center justify-end gap-1 px-1">
                    <span className="text-[10px] font-medium text-subtle">16:42</span>
                    <CheckCheck className="h-3.5 w-3.5 text-brand" />
                  </div>
                )}
              </div>
            ))}
            
            <div className="mt-2 flex items-center gap-2 px-2">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-subtle" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-subtle [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-subtle [animation-delay:0.4s]" />
              </div>
              <span className="text-[12px] font-medium text-subtle italic">Sophia is typing...</span>
            </div>
          </div>
        </div>
      </section>

      {/* Shared Files */}
      <section className="fade-up mt-10 px-6" style={{ animationDelay: "300ms" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-ink">Shared Resources</h2>
          <button className="text-[14px] font-bold text-brand">See All</button>
        </div>
        <div className="mt-5 space-y-3">
          {sharedFiles.map((file) => (
            <div key={file.name} className="flex items-center gap-4 rounded-2xl border border-border/40 bg-white p-4 shadow-sm transition-transform active:scale-[0.98]">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/5 text-brand">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="truncate text-[15px] font-bold text-ink">{file.name}</h4>
                <p className="text-[12px] font-medium text-subtle">{file.size} · {file.type}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-border" />
            </div>
          ))}
        </div>
      </section>

      {/* FAB */}
      <div 
        onClick={() => {
          console.log("DIV Clicked");
          setShowNewChatFlow(true);
        }}
        className="fixed bottom-[max(6.5rem,calc(env(safe-area-inset-bottom)+5.5rem))] right-6 z-[60] flex items-center gap-2 rounded-full bg-brand px-6 py-4 text-white shadow-xl shadow-brand/30 transition-transform active:scale-95 cursor-pointer"
      >
        <Plus className="h-6 w-6" />
        <span className="text-[16px] font-bold">New Chat</span>
      </div>




      {/* Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[520px] px-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between rounded-[22px] border border-border/40 bg-white/80 px-3 py-3 shadow-[0_20px_44px_-22px_rgba(18,18,18,0.2)] backdrop-blur-xl">
          {[
            { label: "Home", icon: HomeIcon, path: "/home", active: false },
            { label: "Matches", icon: Heart, path: "/explore-matches", active: false },
            { label: "Communities", icon: Users, path: "/communities", active: false },
            { label: "Chat", icon: MessageSquare, path: "/chat", active: true },
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
