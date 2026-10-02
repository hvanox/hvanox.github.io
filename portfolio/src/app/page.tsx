import { MatrixRain } from "@/components/chrome/MatrixRain";
import { Player } from "@/components/chrome/Player";
import { ScanlineOverlay } from "@/components/chrome/ScanlineOverlay";
import { TopBar } from "@/components/chrome/TopBar";
import { Win98Window } from "@/components/chrome/Win98Window";
import { ZigzagRail } from "@/components/chrome/ZigzagRail";
import { About } from "@/components/sections/About";
import { Achievements } from "@/components/sections/Achievements";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Footer } from "@/components/sections/Footer";
import { GithubStats } from "@/components/sections/GithubStats";
import { Guestbook } from "@/components/sections/Guestbook";
import { Header } from "@/components/sections/Header";
import { Shrine } from "@/components/sections/Shrine";
import { SideNav } from "@/components/sections/SideNav";
import { Stack } from "@/components/sections/Stack";
import { UpdatesLog } from "@/components/sections/UpdatesLog";
import { Webring } from "@/components/sections/Webring";
import { dict } from "@/content/dict";
import { updates } from "@/content/updates";
import { PlayerProvider } from "@/lib/player-state";

/**
 * Композиция страницы строго по DESIGN.md: верхний TopBar -> Header ->
 * grid [240px_1fr_240px] (lg, ниже — один столбец) -> Footer.
 * Server Component: локализация внутри секций через useI18n/<T/>,
 * здесь только статические данные из dict/profile. Состояние плеера
 * (трек/пауза) живёт в PlayerProvider: TopBar и Player — клиенты,
 * которые его читают. TopBar — та же верхняя полоса, но вместо слоганов
 * крутит текст текущей песни.
 */

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-col">
      <PlayerProvider>
        <TopBar />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 px-7 py-3">
        <Header />

        <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[240px_minmax(0,1fr)_240px]">
          {/* Левая колонка. */}
          <div className="flex min-w-0 flex-col gap-3">
            <Win98Window title={dict.sections.nowPlaying}>
              <Player />
            </Win98Window>
            <SideNav />
            <UpdatesLog entries={updates} />
            <Webring />
          </div>

          {/* Центр. */}
          <main id="main" className="flex min-w-0 flex-col gap-3">
            <About />
            <Stack />
            <Achievements />
            <Experience />
            <Contact />
          </main>

          {/* Правая колонка. */}
          <div className="flex min-w-0 flex-col gap-3">
            <GithubStats />
            <Shrine />
            <Guestbook />
          </div>
        </div>

        <Footer />
      </div>

      <ZigzagRail />
      <ScanlineOverlay />
      <MatrixRain />
      </PlayerProvider>
    </div>
  );
}
