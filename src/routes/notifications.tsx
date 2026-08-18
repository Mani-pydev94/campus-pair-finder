import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Bell,
  Check,
  Trash2,
  Heart,
  MessageSquare,
  Users,
  Calendar,
  Zap,
  Home as HomeIcon,
  ClipboardList,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Campus Connect AI" },
      {
        name: "description",
        content: "Stay updated with your matches, messages, communities and campus events.",
      },
      { property: "og:title", content: "Notifications — Campus Connect AI" },
      {
        property: "og:description",
        content: "Stay updated with your matches, messages, communities and campus events.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotificationsScreen,
});

const categories = [
  { id: "all", label: "All" },
  { id: "matches", label: "Matches" },
  { id: "messages", label: "Messages" },
  { id: "communities", label: "Communities" },
  { id: "events", label: "Events" },
];

const initialNotifications = [
  {
    id: "1",
    category: "matches",
    emoji: "💜",
    icon: Heart,
    title: "You have a new AI match.",
    description: "Meet Priya — 94% compatible with your goals.",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    category: "messages",
    emoji: "💬",
    icon: MessageSquare,
    title: "Sophia sent you a message.",
    description: "\"Are you joining the AI study group?\"",
    time: "15 min ago",
    read: false,
  },
  {
    id: "3",
    category: "communities",
    emoji: "🎓",
    icon: Users,
    title: "AI Builders Hub invited you to join.",
    description: "2,400 members · 12 new posts today",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "4",
    category: "events",
    emoji: "🚀",
    icon: Zap,
    title: "New hackathon announced.",
    description: "Campus Hackathon 2026 · Register by 25 Aug",
    time: "3 hours ago",
    read: false,
  },
  {
    id: "5",
    category: "events",
    emoji: "📚",
    icon: Calendar,
    title: "Your study group starts tomorrow.",
    description: "Machine Learning Circle · 4:00 PM · Library C",
    time: "5 hours ago",
    read: true,
  },
  {
    id: "6",
    category: "matches",
    emoji: "💜",
    icon: Heart,
    title: "Arjun liked your profile.",
    description: "View his profile and start a conversation.",
    time: "Yesterday",
    read: true,
  },
];

function NotificationsScreen() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [notifications, setNotifications] = useState(initialNotifications);

  const filteredNotifications =
    activeCategory === "all"
      ? notifications
      : notifications.filter((n) => n.category === activeCategory);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    toast.success("Marked as read");
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification removed");
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col bg-background pb-[calc(6rem+env(safe-area-inset-bottom))] pt-[max(3rem,calc(env(safe-area-inset-top)+1.5rem))]">
      <header className="fade-up flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link
            to="/home"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-[0_8px_20px_-14px_rgba(18,18,18,0.45)] ring-1 ring-line transition-transform duration-150 active:scale-[0.94]"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-ink" />
          </Link>
          <div>
            <h1 className="text-[28px] font-bold tracking-[-0.02em] text-ink">Notifications</h1>
            <p className="text-sm text-subtle">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={markAllAsRead}
          className="flex h-10 items-center gap-1.5 rounded-full bg-brand/10 px-4 text-[13px] font-semibold text-brand transition-transform duration-150 active:scale-[0.94]"
        >
          <Check className="h-4 w-4" />
          Read all
        </button>
      </header>

      <section className="fade-up mt-5 px-6" style={{ animationDelay: "80ms" }}>
        <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-150 active:scale-[0.95] ${
                activeCategory === category.id
                  ? "bg-ink text-white"
                  : "bg-card text-subtle ring-1 ring-line"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </section>

      <section className="fade-up mt-4 flex-1 px-6" style={{ animationDelay: "160ms" }}>
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <motion.article
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className={`group relative overflow-hidden rounded-[20px] border border-line/70 bg-card p-4 shadow-[0_14px_32px_-28px_rgba(18,18,18,0.5)] transition-shadow duration-200 ${
                    !notification.read ? "ring-1 ring-brand/20" : ""
                  }`}
                >
                  {!notification.read && (
                    <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-brand to-brand-light" />
                  )}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg ${
                        !notification.read
                          ? "bg-brand/10"
                          : "bg-secondary"
                      }`}
                    >
                      {notification.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`text-[15px] font-semibold leading-snug ${!notification.read ? "text-ink" : "text-subtle"}`}>
                          {notification.title}
                        </h3>
                        <span className="shrink-0 text-[11px] text-subtle">{notification.time}</span>
                      </div>
                      <p className="mt-1 text-[13px] leading-snug text-subtle">
                        {notification.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        {!notification.read && (
                          <button
                            type="button"
                            onClick={() => markAsRead(notification.id)}
                            className="flex h-8 items-center gap-1.5 rounded-full bg-brand/10 px-3 text-[12px] font-semibold text-brand transition-transform duration-150 active:scale-[0.94]"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Mark as read
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteNotification(notification.id)}
                          className="flex h-8 items-center gap-1.5 rounded-full bg-danger/10 px-3 text-[12px] font-semibold text-danger transition-transform duration-150 active:scale-[0.94]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex flex-col items-center justify-center rounded-[24px] border border-line/70 bg-card px-6 py-16 text-center shadow-[0_14px_32px_-28px_rgba(18,18,18,0.5)]"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                <Bell className="h-9 w-9 text-subtle" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-ink">No new notifications</h3>
              <p className="mt-2 max-w-[240px] text-sm text-subtle">
                You&apos;re all caught up. We&apos;ll notify you when something important happens.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-[520px] px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex h-14 items-center justify-between rounded-[22px] border border-line/70 bg-white px-3 py-1 shadow-[0_20px_44px_-22px_rgba(18,18,18,0.2)]">
          {[
            { label: "Home", icon: HomeIcon, path: "/home", active: false },
            { label: "Matches", icon: Heart, path: "/explore-matches", active: false },
            { label: "Communities", icon: Users, path: "/communities", active: false },
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
