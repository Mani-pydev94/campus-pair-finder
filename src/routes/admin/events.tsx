import { createFileRoute } from "@tanstack/react-router";
import { EventsManager } from "@/components/admin/EventsManager";

export const Route = createFileRoute("/admin/events")({
  head: () => ({
    meta: [
      { title: "Admin — Events — Campus Connect AI" },
      { name: "description", content: "Create, edit and remove campus events." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminEventsPage,
});

function AdminEventsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink">Events</h1>
        <p className="text-sm text-subtle">Create, edit and remove upcoming campus events.</p>
      </div>
      <EventsManager />
    </div>
  );
}
