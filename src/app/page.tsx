import { BoardScroll } from "@/components/board/BoardScroll";
import {
  AboutOverlay,
  BarsOverlay,
  ClockOverlay,
  GearOverlay,
  GithubOverlay,
  ProfileOverlay,
  SongsOverlay,
  StackOverlay,
} from "@/components/overlays/LeftOverlays";
import {
  AchievementsOverlay,
  ContactOverlay,
  ExperienceOverlay,
  NowPlayingOverlay,
  PictureOverlay,
  RoleOverlay,
  SystemMessageOverlay,
  TogglesOverlay,
} from "@/components/overlays/RightOverlays";
import { PlayerDialogProvider } from "@/components/player/PlayerDialog";
import { PlayerProvider } from "@/lib/player";

/**
 * Сайт = эдит Kasane Teto от reathaa. Картинка — фон (из неё скриптом
 * scripts/clean-board.py вытерт зашитый текст), поверх каждой её панели
 * лежит живой текст и кнопки. Координаты оверлеев — пиксели исходника 736×414.
 * Порядок в DOM = порядок чтения: слева направо, сверху вниз.
 */
export default function Home() {
  return (
    <PlayerProvider>
      <PlayerDialogProvider>
        <BoardScroll>
          <main className="board-frame">
            <div className="board">
              {/* eslint-disable-next-line @next/next/no-img-element -- статический экспорт, картинка уже 2× */}
              <img
                src="/board/board.webp"
                alt="Kasane Teto — edit by reathaa"
                width={1472}
                height={828}
                fetchPriority="high"
                className="absolute inset-0 size-full select-none"
                draggable={false}
              />

              <AboutOverlay />
              <StackOverlay />
              <GithubOverlay />
              <SongsOverlay />
              <GearOverlay />
              <BarsOverlay />
              <ClockOverlay />
              <ProfileOverlay />

              <RoleOverlay />
              <NowPlayingOverlay />
              <TogglesOverlay />
              <AchievementsOverlay />
              <SystemMessageOverlay />
              <ContactOverlay />
              <ExperienceOverlay />
              <PictureOverlay />
            </div>
          </main>
        </BoardScroll>
      </PlayerDialogProvider>
    </PlayerProvider>
  );
}
