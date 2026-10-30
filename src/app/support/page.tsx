import type { Metadata } from "next";
import Image from "next/image";
import { Coffee, Heart, Star } from "lucide-react";
import { REPO } from "@/components/site";

export const metadata: Metadata = {
  title: "Buy me a coffee",
  description: "Jyotish is free and open source. A coffee over UPI keeps it that way.",
};

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <div className="card rise grid gap-8 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gold">
            <Coffee size={16} /> Buy me a coffee
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold">Keep Jyotish free for everyone</h1>
          <p className="mt-4 text-ink-2">
            I build Jyotish on my own time and keep it free, with no ads and no sign-up. If it helped you, taught you something,
            or you just like having an honest astrology site around, a coffee is the kindest way to say thanks. Every one buys me
            more hours to build and improve Jyotish and my other open-source projects.
          </p>
          <p className="mt-4 font-semibold">
            UPI ID: <span className="text-gold-ink">8941951465@axl</span> <span className="font-normal text-muted">(or +91 8941951465)</span>
          </p>
          <p className="mt-1 text-sm text-ink-2">
            Scan the code with Google Pay, PhonePe, Paytm, BHIM or any UPI app. International payments are welcome too.
          </p>
          <p className="mt-4 flex items-center gap-2 text-sm text-ink-2">
            <Heart size={15} className="text-saffron" /> However small, every coffee keeps the work going. Thank you!
          </p>
          <a href={REPO} className="mt-5 inline-flex items-center gap-2 text-sm text-gold-ink hover:underline">
            <Star size={15} /> A star on GitHub or sharing Jyotish with a friend helps too
          </a>
        </div>
        <Image src="/upi-qr.png" alt="UPI QR code for 8941951465@axl" width={200} height={200} className="mx-auto rounded-xl bg-white p-2" />
      </div>
    </div>
  );
}
