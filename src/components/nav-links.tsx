"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/kundli", label: "Kundli" },
  { href: "/panchang", label: "Panchang" },
  { href: "/matching", label: "Matching" },
];

export function NavLinks() {
  const path = usePathname();
  return (
    <nav className="flex items-center text-[13px] font-medium sm:gap-0.5 sm:text-sm">
      {LINKS.map((l) => {
        const active = path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-full px-2.5 py-2 transition sm:px-3 ${active ? "bg-raise text-gold-ink" : "text-ink-2 hover:bg-hover hover:text-ink"}`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
