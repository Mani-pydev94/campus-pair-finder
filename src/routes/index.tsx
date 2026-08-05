import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, GraduationCap, Users } from "lucide-react";
import students from "@/assets/students.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campus Connect AI — Find Your Perfect Study Partner" },
      {
        name: "description",
        content:
          "AI powered study partner matches based on your personality, goals, values and interests.",
      },
      { property: "og:title", content: "Campus Connect AI — Find Your Perfect Study Partner" },
      {
        property: "og:description",
        content: "AI powered study partner matches based on your personality, goals, values and interests.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-background px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(4.5rem,calc(env(safe-area-inset-top)+3rem))]">
      <h1
        className="fade-up text-[40px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink"
        style={{ animationDelay: "40ms" }}
      >
        <span className="text-brand">Find your</span>
        <br />
        perfect study
        <br />
        partner.
      </h1>

      <p
        className="fade-up mt-4 max-w-[70%] text-base font-medium leading-[1.5] text-subtle"
        style={{ animationDelay: "140ms" }}
      >
        AI powered matches based on your personality, goals, values and interests.
      </p>

      <div
        className="fade-up relative my-auto flex h-[40vh] min-h-[280px] items-end justify-center"
        style={{ animationDelay: "240ms" }}
      >
        <div className="absolute inset-x-6 bottom-6 top-10 rounded-full border border-dashed border-brand/15" />

        <span
          className="absolute left-0 top-[18%] flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.25)] animate-[float_6s_ease-in-out_infinite]"
          aria-hidden
        >
          <Heart className="h-6 w-6 fill-brand text-brand" />
        </span>
        <span
          className="absolute left-1/2 top-0 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-emerald-100 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.25)] animate-[float_7s_ease-in-out_infinite_0.8s]"
          aria-hidden
        >
          <GraduationCap className="h-5 w-5 text-emerald-600" />
        </span>
        <span
          className="absolute right-0 top-[18%] flex h-14 w-14 items-center justify-center rounded-full bg-pink-100 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.25)] animate-[float_8s_ease-in-out_infinite_0.4s]"
          aria-hidden
        >
          <Users className="h-6 w-6 text-pink-500" />
        </span>

        <img
          src={students}
          alt="Two smiling students holding tablets"
          width={1024}
          height={1024}
          className="relative h-full w-auto max-w-full object-contain drop-shadow-[0_24px_40px_rgba(18,18,18,0.14)] animate-[float_7s_ease-in-out_infinite]"
        />
      </div>

      <button
        type="button"
        className="fade-up mt-8 h-14 w-full rounded-2xl bg-gradient-to-r from-brand to-brand-deep text-[18px] font-semibold text-on-brand shadow-cta transition-transform duration-150 active:scale-[0.97]"
        style={{ animationDelay: "340ms" }}
      >
        Get Started
      </button>

      <p
        className="fade-up mt-6 text-center text-[15px] text-subtle"
        style={{ animationDelay: "420ms" }}
      >
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand">
          Login
        </Link>
      </p>
    </main>
  );
}
