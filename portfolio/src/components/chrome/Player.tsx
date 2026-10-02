"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Square } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { usePlayerState } from "@/lib/player-state";
import { dict } from "@/content/dict";
import { playlist, watchUrl } from "@/content/playlist";
import { cn } from "@/lib/utils";

/**
 * Winamp-подобный плеер поверх официальных клипов YouTube.
 *
 * Звук и картинка — iframe API: видео видно в мини-экране, просмотры
 * капают авторам. Свой транспорт (play/pause/stop) дергает API, состояние
 * читаем из onStateChange. Чужие аудиоданные недоступны из JS принципиально,
 * поэтому визуализатора здесь нет — только статичная полоса; бар текста
 * песни (LyricsBar) крутится, пока играет.
 *
 * Правила: никакого autoplay — всё стартует только с клика (сначала cue,
 * play лишь по кнопке). Видео не встраивается — показываем trackUnplayable.
 */

type YTPlayerInstance = {
  cueVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  destroy: () => void;
};

type YTApi = {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: () => void;
        onStateChange?: (event: { data: number }) => void;
        onError?: () => void;
      };
    },
  ) => YTPlayerInstance;
  PlayerState: { PLAYING: number; CUED: number };
};

type Availability = "probing" | "ready" | "missing";

const btnClass =
  "grid size-7 shrink-0 place-items-center border border-chrome bg-void text-bone transition-transform hover:border-blood hover:text-blood active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-chrome disabled:hover:text-bone";

/** Скрипт iframe API грузим один раз на страницу, дальше переиспользуем. */
let apiPromise: Promise<YTApi> | null = null;

function loadYouTubeApi(): Promise<YTApi> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const known = (window as unknown as { YT?: YTApi }).YT;
  if (known?.Player) return Promise.resolve(known);

  if (!apiPromise) {
    apiPromise = new Promise<YTApi>((resolve, reject) => {
      const win = window as unknown as {
        YT?: YTApi;
        onYouTubeIframeAPIReady?: () => void;
      };
      const prev = win.onYouTubeIframeAPIReady;
      win.onYouTubeIframeAPIReady = () => {
        prev?.();
        if (win.YT?.Player) resolve(win.YT);
        else {
          apiPromise = null;
          reject(new Error("youtube api missing"));
        }
      };
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.onerror = () => {
        apiPromise = null;
        reject(new Error("youtube api load failed"));
      };
      document.head.appendChild(tag);
    });
  }
  return apiPromise;
}

/**
 * Плавающий бар текста песни над плеером. Текст крутится бегущей строкой,
 * пока трек играет, на паузе — замирает (animation-play-state). Две копии
 * строки подряд: keyframes marquee едет на -50%, шов бесшовный. Скорость —
 * примерно 9 символов в секунду, чтобы успевать читать. Без текста песни
 * крутим название. При prefers-reduced-motion глобальное правило глушит
 * анимацию — бар становится статичным.
 */
function LyricsBar({
  title,
  artist,
  lines,
  playing,
  label,
}: {
  title: string;
  artist: string;
  lines: string[];
  playing: boolean;
  label: string;
}) {
  const text = lines.length > 0 ? lines.join(" ✦ ") : `${title} — ${artist}`;
  const duration = Math.max(40, Math.round(text.length / 9));

  return (
    <div
      role="marquee"
      aria-label={label}
      className="overflow-hidden border border-blood bg-void-deep px-2 py-1 shadow-glow-blood"
    >
      <div
        aria-hidden="true"
        className="animate-marquee flex w-max"
        style={{
          animationDuration: `${duration}s`,
          animationPlayState: playing ? "running" : "paused",
        }}
      >
        <span className="pr-12 font-jp text-[11px] whitespace-nowrap text-bone">{text}</span>
        <span className="pr-12 font-jp text-[11px] whitespace-nowrap text-bone">{text}</span>
      </div>
      <span className="sr-only">{text}</span>
    </div>
  );
}

export function Player() {
  const { t } = useI18n();
  const { track, playing, selectTrack, setPlaying } = usePlayerState();

  const [availability, setAvailability] = useState<Availability>("probing");
  // Автоплей со звуком браузеры режут без жеста пользователя, немой —
  // разрешают. Поэтому: пробуем громко, не вышло — играем немо и показываем
  // кнопку «включи звук»; первый же клик/кейпресс по странице размьючивает.
  const [muted, setMuted] = useState(false);
  // Гидрация: сервер и первый рендер клиента обязаны совпасть, поэтому
  // `disabled` включаем только после монтирования (кнопки до этого inert:
  // обработчики всё равно сторожат состояние).
  const [mounted, setMounted] = useState(false);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  // ID для создания iframe: берём один раз (дальше треки меняет cue).
  const [initialYoutubeId] = useState(
    () => playlist.find((item) => item.id === track.id)?.youtubeId ?? "",
  );
  // Актуальный ID для onReady: если трек выбрали до загрузки API,
  // cue потерялся бы — onReady подхватит его отсюда. Пишем только
  // в эффекте, не в рендере (иначе ругается react-hooks/refs).
  const pendingYoutubeId = useRef(initialYoutubeId);
  useEffect(() => {
    pendingYoutubeId.current = track.youtubeId;
  }, [track.youtubeId]);

  const disabled = availability !== "ready";
  const buttonDisabled = mounted && disabled;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Рождение iframe-плеера: один раз, дальше только cue новых видео.
  // Сразу пробуем автоплей со звуком; если браузер не дал (нет жеста) —
  // через 2.5с уходим в немой автоплей + кнопка размьюта.
  useEffect(() => {
    let cancelled = false;
    let instance: YTPlayerInstance | null = null;
    let played = false;
    let watchdog = 0;

    loadYouTubeApi()
      .then((api) => {
        if (cancelled || !hostRef.current) return;
        instance = new api.Player(hostRef.current, {
          videoId: initialYoutubeId,
          playerVars: { rel: 0 },
          events: {
            onReady: () => {
              if (cancelled) return;
              // Догружаем актуальный трек: могли выбрать до готовности API.
              try {
                instance?.cueVideoById(pendingYoutubeId.current);
              } catch {
                setAvailability("missing");
                return;
              }
              setAvailability("ready");
              // Автоплей: сначала громко — вдруг браузер разрешит
              // (возвращающиеся посетители с историей жестов).
              try {
                instance?.playVideo();
              } catch {
                // Молча: watchdog ниже сам уйдёт в немой режим.
              }
              watchdog = window.setTimeout(() => {
                if (cancelled || played) return;
                try {
                  instance?.mute();
                  instance?.playVideo();
                } catch {
                  setAvailability("missing");
                }
              }, 2500);
            },
            onStateChange: (event) => {
              if (cancelled) return;
              const apiNow = (window as unknown as { YT?: YTApi }).YT;
              if (event.data === apiNow?.PlayerState.PLAYING) {
                played = true;
                setAvailability("ready");
                setPlaying(true);
                try {
                  setMuted(instance?.isMuted() ?? false);
                } catch {
                  setMuted(false);
                }
              } else {
                setPlaying(false);
                if (event.data === apiNow?.PlayerState.CUED) setAvailability("ready");
              }
            },
            onError: () => {
              if (!cancelled) {
                setAvailability("missing");
                setPlaying(false);
              }
            },
          },
        });
        playerRef.current = instance;
      })
      .catch(() => {
        if (!cancelled) setAvailability("missing");
      });

    return () => {
      cancelled = true;
      window.clearTimeout(watchdog);
      instance?.destroy();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = useCallback(
    (id: string) => {
      selectTrack(id);
      setAvailability("probing");
      const next = playlist.find((item) => item.id === id);
      if (next) {
        try {
          playerRef.current?.cueVideoById(next.youtubeId);
        } catch {
          setAvailability("missing");
        }
      }
    },
    [selectTrack],
  );

  const play = useCallback(() => {
    if (disabled) return;
    try {
      playerRef.current?.playVideo();
    } catch {
      setAvailability("missing");
    }
  }, [disabled]);

  const pause = useCallback(() => {
    try {
      playerRef.current?.pauseVideo();
    } catch {
      setAvailability("missing");
    }
    setPlaying(false);
  }, [setPlaying]);

  const stop = useCallback(() => {
    try {
      playerRef.current?.stopVideo();
    } catch {
      setAvailability("missing");
    }
    setPlaying(false);
  }, [setPlaying]);

  const unmute = useCallback(() => {
    try {
      playerRef.current?.unMute();
      playerRef.current?.playVideo();
    } catch {
      setAvailability("missing");
      return;
    }
    setMuted(false);
    setPlaying(true);
  }, [setPlaying]);

  // Первый жест по странице размьючивает немой автоплей.
  useEffect(() => {
    const onGesture = () => {
      try {
        const peer = playerRef.current;
        if (peer?.isMuted()) {
          peer.unMute();
          peer.playVideo();
          setMuted(false);
          setPlaying(true);
        }
      } catch {
        // Игнорируем: транспорт всё равно доступен вручную.
      }
    };
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, [setPlaying]);

  return (
    <div className="flex flex-col gap-2">
      <LyricsBar
        title={track.title}
        artist={track.artist}
        lines={track.lyrics}
        playing={playing}
        label={t(dict.player.lyrics)}
      />

      {/* Хост iframe: звук идёт отсюда, картинки нет — видеоэкран
          не нужен, поэтому держим плеер 1×1 и прозрачным (display:none
          браузеры умеют глушить, opacity — нет). */}
      <div aria-hidden="true" className="absolute h-px w-px overflow-hidden opacity-0">
        <div ref={hostRef} />
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={playing ? pause : play}
          disabled={buttonDisabled}
          aria-label={playing ? t(dict.player.pause) : t(dict.player.play)}
          className={btnClass}
        >
          {playing ? (
            <Pause aria-hidden="true" className="size-3.5" strokeWidth={2} />
          ) : (
            <Play aria-hidden="true" className="size-3.5" strokeWidth={2} />
          )}
        </button>

        <button
          type="button"
          onClick={stop}
          disabled={buttonDisabled}
          aria-label={t(dict.player.stop)}
          className={btnClass}
        >
          <Square aria-hidden="true" className="size-3.5" strokeWidth={2} />
        </button>

        <p className="ml-1 min-w-0 flex-1 truncate font-pixel text-[9px] tracking-[0.06em] text-bone-dim uppercase">
          {availability === "missing" ? (
            t(dict.player.trackUnplayable)
          ) : (
            <>
              {track.title} — {track.artist}
            </>
          )}
        </p>
      </div>

      {/* Подпись автора со ссылкой на официальный клип. */}
      <a
        href={watchUrl(track)}
        target="_blank"
        rel="noopener noreferrer"
        className="w-fit font-pixel text-[9px] tracking-[0.06em] text-bone-dim uppercase hover:text-blood"
      >
        {t(dict.player.watchOnYoutube)}: {track.artist} ↗
      </a>

      {/* Немой автоплей: мигающая кнопка размьюта. */}
      {muted && !disabled ? (
        <button
          type="button"
          onClick={unmute}
          className="animate-blink w-fit border border-acid bg-void-deep px-2 py-1 font-pixel text-[10px] tracking-[0.08em] text-acid uppercase hover:bg-acid hover:text-void-deep"
        >
          [ {t(dict.player.unmute)} ]
        </button>
      ) : null}

      <div>
        <p className="mb-1 font-pixel text-[9px] tracking-[0.06em] text-bone-dim uppercase">
          {t(dict.player.tracklist)}
        </p>
        <ol className="flex flex-col">
          {playlist.map((item, index) => {
            const active = item.id === track.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => select(item.id)}
                  aria-current={active}
                  className={cn(
                    "flex w-full items-baseline gap-2 px-1 py-0.5 text-left font-pixel text-[9px] tracking-[0.04em] uppercase transition-colors",
                    active ? "bg-blood text-bone" : "text-bone-dim hover:bg-void-deep hover:text-cyan",
                  )}
                >
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1 truncate">
                    {item.title} — {item.artist}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
