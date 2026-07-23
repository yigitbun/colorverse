import { Link } from "react-router-dom";
import { ArrowRight, Palette } from "lucide-react";

export default function About() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 md:py-24">
      <div className="mb-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 transition hover:text-neutral-900 dark:text-[#64748B] dark:hover:text-[#E2E8F0]"
        >
          <Palette className="h-3.5 w-3.5" /> ColorVerse
        </Link>
      </div>
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-[#64748B]">
        About
      </p>
      <h1 className="text-4xl font-bold leading-tight tracking-tight dark:text-[#E2E8F0] md:text-5xl">
        Built by someone who kept guessing wrong colors.
      </h1>
      <div className="mt-10 space-y-6 text-[17px] leading-relaxed text-neutral-600 dark:text-[#94A3B8]">
        <p>
          I'm an indie developer. Not a designer. Every side project I've ever built has
          had the same problem: I'd find a palette I liked, stare at five hex codes, and
          have absolutely no idea if they'd work together in a real UI.
        </p>
        <p>
          I'd paste them into Figma. Build a rough mockup. Realize the contrast was wrong
          on the buttons. Start over. An hour later I'd have a landing page that looked
          fine but felt off — and I couldn't explain why.
        </p>
        <p>
          ColorVerse is the tool I wanted. Not a color wheel. Not an academic breakdown of
          complementary theory. Just: here's a palette, here's what your landing page
          looks like in it. Here's what your slides look like. Here's what your Etsy
          listing looks like. Does it feel right? Good. Export it and ship.
        </p>
        <p>
          The extract tool came from the same frustration — I'd see a photo I loved and
          think "that's the vibe I want," but translating a photo into five working hex
          codes meant opening Photoshop and doing color math. Now I just upload it.
        </p>
        <p>
          This is a solo project. No VC, no team, no roadmap driven by quarterly targets.
          Just me, building something I actually use, for people who have the same
          problem I had.
        </p>
        <p>
          If you've got feedback, a palette request, or you just want to say hi — reach
          out. I read everything.
        </p>
      </div>
      <div className="mt-12 flex flex-wrap gap-4">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-[#22D3EE] dark:text-[#0B1220] dark:hover:bg-[#38BDF8]"
        >
          Browse palettes <ArrowRight className="h-4 w-4" />
        </Link>
        <a
          href="mailto:hello@colorverse.app"
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-[#15203A] dark:bg-[#15203A] dark:text-[#E2E8F0] dark:hover:bg-[#1e2d4a]"
        >
          Say hi
        </a>
      </div>
    </main>
  );
}
