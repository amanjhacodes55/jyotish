import Link from "next/link";
import { Coffee } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { NavLinks } from "./nav-links";

export const REPO = "https://github.com/amanjhacodes55/jyotish";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Jyotish home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.svg" alt="" width={34} height={34} className="h-8 w-8 rounded-lg sm:h-[34px] sm:w-[34px]" />
      <span className="font-display text-xl font-bold tracking-wide sm:text-2xl">Jyotish</span>
    </Link>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
        <Logo />
        <div className="flex items-center sm:gap-1">
          <NavLinks />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function GithubMark() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line/70">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-ink-2 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm text-muted">
            Free, open-source Vedic astrology. Every chart is calculated by Jyotish&apos;s own engine with the Lahiri
            ayanamsa; nothing about you is stored.
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-ink">Tools</p>
          <Link className="block hover:text-ink" href="/kundli">Kundli</Link>
          <Link className="block hover:text-ink" href="/panchang">Panchang</Link>
          <Link className="block hover:text-ink" href="/matching">Kundli matching</Link>
          <Link className="block hover:text-ink" href="/saved">My saved kundlis</Link>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-ink">Project</p>
          <a className="flex items-center gap-2 hover:text-ink" href={REPO}>
            <GithubMark /> Source code
          </a>
          <Link className="flex items-center gap-2 hover:text-ink" href="/support">
            <Coffee size={16} /> Buy me a coffee
          </Link>
        </div>
      </div>
      <p className="pb-8 text-center text-xs text-muted">MIT License · Made in India by Aman Jha</p>
    </footer>
  );
}
