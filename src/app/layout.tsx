import type { Metadata, Viewport } from "next";
import { Arimo, Cousine, Great_Vibes, Montserrat, Zen_Kaku_Gothic_New } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import { MotionProvider } from "@/lib/motion";
import { QueryProvider } from "@/lib/query-provider";
import "./globals.css";

/*
 * Шрифты подобраны под эдит reathaa: системный текст там — Arial/Helvetica
 * (Arimo — его метрический двойник), «GFX / Graphic Design» — жирный
 * геометрический курсив, «Bunnies / Songs» — каллиграфия, «Loading» — Courier.
 */
const sans = Arimo({ variable: "--font-arimo", subsets: ["latin", "cyrillic"], style: ["normal", "italic"] });
const display = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  weight: ["700", "800", "900"],
  style: ["normal", "italic"],
});
const script = Great_Vibes({ variable: "--font-great-vibes", subsets: ["latin", "cyrillic"], weight: "400" });
const mono = Cousine({ variable: "--font-cousine", subsets: ["latin", "cyrillic"], weight: ["400", "700"] });
const jp = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "hvano // kasane teto",
  description:
    "Portfolio of hvano — backend developer. Python, C, PostgreSQL, Docker, Linux. Kasane Teto board after an edit by reathaa.",
  metadataBase: new URL("https://hvanox.github.io"),
  openGraph: {
    title: "hvano // kasane teto",
    description: "backend developer · python · c · postgres · docker · breakcore",
    url: "https://hvanox.github.io",
    siteName: "hvano",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#93414a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${script.variable} ${mono.variable} ${jp.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full overflow-x-hidden">
        <QueryProvider>
          <I18nProvider>
            <MotionProvider>{children}</MotionProvider>
          </I18nProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
