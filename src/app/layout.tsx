import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist, Noto_Serif_Devanagari } from "next/font/google";
import { Footer, Header } from "@/components/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const display = Cormorant_Garamond({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600", "700"] });
const deva = Noto_Serif_Devanagari({ variable: "--font-deva", subsets: ["devanagari"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: { default: "Jyotish — free Vedic astrology: kundli, panchang and matching", template: "%s · Jyotish" },
  description:
    "Free, open-source Vedic astrology. Make your kundli with North and South Indian charts, Navamsa and Vimshottari dasha, read today's panchang, and match kundlis with Guna Milan. No sign-up.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0a1a" },
    { media: "(prefers-color-scheme: light)", color: "#fbf7ef" },
  ],
};

/** Sets the saved or system theme on <html> before the first paint (see src/client/theme.ts), so there is no flash. */
const THEME_SCRIPT = `(()=>{try{var t=localStorage.getItem("jyotish:theme"),d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches),r=document.documentElement;r.dataset.theme=d?"dark":"light";r.style.colorScheme=d?"dark":"light";if(t)document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){m.setAttribute("content",d?"#0b0a1a":"#fbf7ef")})}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${display.variable} ${deva.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
