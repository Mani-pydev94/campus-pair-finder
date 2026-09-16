import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { applyMigrationFn } from "./apply-migration.server";

export const Route = createFileRoute("/apply-migration")({
  component: ApplyMigrationPage,
});

function ApplyMigrationPage() {
  const applyMutation = useServerFn(applyMigrationFn);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<any>(null);

  const handleApply = async () => {
    setStatus("loading");
    try {
      const res = await applyMutation({});
      setResult(res);
      setStatus(res.ok ? "success" : "error");
    } catch (e: any) {
      setResult({ ok: false, error: e.message });
      setStatus("error");
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Apply Questionnaire Responses Migration</h1>
      <p className="text-subtle">
        This will fix the unique constraint on questionnaire_responses to include category.
      </p>

      <div className="rounded-xl border border-line bg-card p-4 space-y-3">
        <button
          onClick={handleApply}
          disabled={status === "loading"}
          className="w-full h-11 rounded-lg bg-brand text-on-brand font-semibold disabled:opacity-50"
        >
          {status === "loading" ? "Applying..." : "Apply Migration"}
        </button>

        {result && (
          <div
            className={`rounded-lg p-3 text-sm ${
              result.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
          >
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </main>
  );
}