import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SavedList } from "@/components/saved-kundlis";

export const metadata: Metadata = { title: "My saved kundlis" };

export default function SavedPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-wider text-gold">My kundlis</p>
      <SavedList
        title="Saved kundlis"
        empty={
          <div className="card mt-4 p-8 text-center">
            <h1 className="font-display text-3xl font-semibold">No saved kundlis yet</h1>
            <p className="mt-2 text-ink-2">Make a kundli and press Save. It stays in this browser, ready to open or use for matching.</p>
            <Link href="/kundli" className="btn btn-primary mt-5">
              Make a kundli <ArrowRight size={18} />
            </Link>
          </div>
        }
      />
    </div>
  );
}
