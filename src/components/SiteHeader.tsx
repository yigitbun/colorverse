import { Link, NavLink } from "react-router-dom";
import { Palette, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  "rounded-lg px-3 py-1.5 transition " +
  (isActive
    ? "bg-neutral-100 text-neutral-900 dark:bg-[#15203A] dark:text-[#E2E8F0]"
    : "text-neutral-600 hover:text-neutral-900 dark:text-[#94A3B8] dark:hover:text-[#E2E8F0]");

export function SiteHeader() {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-[#15203A] dark:bg-[#0B1220]/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold tracking-tight dark:text-[#E2E8F0]"
        >
          <Palette className="h-5 w-5" />
          <span>ColorVerse</span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm md:flex">
          <NavLink to="/explore" className={navLinkClassName}>
            Explore
          </NavLink>
          <NavLink to="/extract" className={navLinkClassName}>
            Extract
          </NavLink>
          <NavLink to="/about" className={navLinkClassName}>
            About
          </NavLink>
          <a
            href="/#pricing"
            className="rounded-lg px-3 py-1.5 text-neutral-600 transition hover:text-neutral-900 dark:text-[#94A3B8] dark:hover:text-[#E2E8F0]"
          >
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to Midnight Tech"}
            title={theme === "dark" ? "Light mode" : "Midnight Tech"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900 dark:border-[#15203A] dark:bg-[#15203A] dark:text-[#94A3B8] dark:hover:text-[#22D3EE]"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-800 dark:bg-[#22D3EE] dark:text-[#0B1220] dark:hover:bg-[#38BDF8] md:text-sm"
          >
            Try the demo
          </Link>
        </div>
      </div>
    </header>
  );
}
