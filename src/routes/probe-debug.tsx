import { createFileRoute } from "@tanstack/react-router";
import { QuestionnaireManager } from "@/components/admin/__probe_QM";

export const Route = createFileRoute("/probe-debug")({
  component: ProbePage,
});

function ProbePage() {
  const noop = async () => ({ ok: true, error: null });
  // Auto-click the first "Questions" button once categories have loaded,
  // so a headless probe can capture the post-click DOM.
  typeof window !== "undefined" &&
    setTimeout(() => {
      const tryClick = () => {
        const btns = Array.from(document.querySelectorAll("button")) as HTMLButtonElement[];
        const q = btns.find((b) => (b.textContent || "").trim() === "Questions");
        console.log("[PROBE] Questions button found:", !!q);
        if (q) {
          q.click();
          setTimeout(() => {
            const hasQ = Array.from(document.querySelectorAll("h3")).some((h) =>
              (h.textContent || "").startsWith("Sample question"),
            );
            console.log("[PROBE] question cards visible:", hasQ);
            console.log("[PROBE] root len:", document.getElementById("root")?.innerHTML.length);
            console.log("[PROBE] contains 'No questions':", !!document.getElementById("root")?.innerHTML.includes("No questions"));
          }, 2000);
        } else {
          setTimeout(tryClick, 300);
        }
      };
      tryClick();
    }, 800);
  return <QuestionnaireManager deleteQuestion={noop as any} />;
}
