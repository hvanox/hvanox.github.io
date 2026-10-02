import type { Metadata } from "next";
import { Anton, IBM_Plex_Mono, Silkscreen, Zen_Kaku_Gothic_New } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import { QueryProvider } from "@/lib/query-provider";
import "./globals.css";

const display = Anton({ variable: "--font-anton", subsets: ["latin"], weight: "400" });
const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});
const pixel = Silkscreen({ variable: "--font-silkscreen", subsets: ["latin"], weight: "400" });
const jp = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "hvano // kasane teto",
  description:
    "Portfolio of hvano — backend developer. Python, C, PostgreSQL, Docker, Linux. Breakcore and Kasane Teto included.",
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${mono.variable} ${pixel.variable} ${jp.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <QueryProvider>
          <I18nProvider>{children}</I18nProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
