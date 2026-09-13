import { Marquee } from "@/components/chrome/Marquee";
import { Player } from "@/components/chrome/Player";
import { ScanlineOverlay } from "@/components/chrome/ScanlineOverlay";
import { TetoArt } from "@/components/chrome/TetoArt";
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
import { Status } from "@/components/sections/Status";
import { UpdatesLog } from "@/components/sections/UpdatesLog";
import { Webring } from "@/components/sections/Webring";
import art from "@/content/art.json";
import { dict } from "@/content/dict";
import { achievements, profile } from "@/content/profile";
import { updates } from "@/content/updates";

/**
 * Композиция страницы строго по DESIGN.md: верхний Marquee -> Header ->
 * grid [240px_1fr_240px] (lg, ниже — один столбец) -> Footer.
 * Server Component: локализация внутри секций через useI18n/<T/>,
 * здесь только статические данные из dict/profile (обе локали сразу,
 * чтобы Marquee остался серверным).
 */

const marqueeItems = [
  `${dict.header.slogan.ru} / ${dict.header.slogan.en}`,
  `${profile.tagline.ru} / ${profile.tagline.en}`,
  ...achievements.map((item) => item.title.ru),
  profile.tetoName,
];

/** Арты, выступающие из сетки: декорация, клики не перехватывают. */
const decoLeft = art[2] ?? art[0];
const decoRight = art[5] ?? art[0];
const decoBottom = art[7] ?? art[0];

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-col">
      <Marquee items={marqueeItems} />

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
            <Status />
            <GithubStats />
            <Shrine />
            <Guestbook />
          </div>
        </div>

        {/* Выступающие арты: absolute, вне текстового потока,
            на мобиле скрыты, чтобы не ломать одноколоночную раскладку. */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -left-4 hidden w-28 -rotate-3 lg:block"
          >
            <TetoArt
              src={decoLeft.src}
              artist={decoLeft.artist}
              width={decoLeft.width}
              height={decoLeft.height}
              alt=""
            />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-4 hidden w-28 rotate-3 lg:block"
          >
            <TetoArt
              src={decoRight.src}
              artist={decoRight.artist}
              width={decoRight.width}
              height={decoRight.height}
              alt=""
            />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 left-1/3 hidden w-24 rotate-2 lg:block"
          >
            <TetoArt
              src={decoBottom.src}
              artist={decoBottom.artist}
              width={decoBottom.width}
              height={decoBottom.height}
              alt=""
            />
          </div>
        </div>

        <Footer />
      </div>

      <ZigzagRail />
      <ScanlineOverlay />
    </div>
  );
}
