"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

// The page's URL holds the whole chart, so sharing it shares the kundli
export function ShareButton({ label = "Share" }: { label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-ghost text-sm"
      onClick={async () => {
        const url = location.href;
        try {
          if (navigator.share && matchMedia("(pointer: coarse)").matches) {
            await navigator.share({ title: document.title, url });
            return;
          }
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {}
      }}
    >
      {copied ? <Check size={16} /> : <Share2 size={16} />} {copied ? "Link copied" : label}
    </button>
  );
}
