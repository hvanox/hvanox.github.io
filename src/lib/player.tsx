
/**
 * Плеер поверх официальных клипов YouTube (iframe API) + его общее состояние.
 *
 * Iframe живёт здесь, в провайдере, а не в окне плеера: окно можно закрыть,
 * а музыка играть продолжит. Панели борда (Songs, бары, папка профиля,
 * модалка) только читают состояние и дёргают действия.
 *
 * Логика автоплея перенесена из старого лендинга: пробуем громко, браузер
 * не дал — через 2.5с играем немо, первый жест по странице размьючивает.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { playlist, type Track } from "../content/playlist";

type YTPlayerInstance = {
  cueVideoById: (videoId: string) => void;
  loadVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  setVolume: (volume: number) => void;
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
      width?: number;
      height?: number;
      host?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: () => void;
        onStateChange?: (event: { data: number }) => void;
        onError?: () => void;
      };
    },
  ) => YTPlayerInstance;
  PlayerState: { PLAYING: number; CUED: number; ENDED: number };
};

export type Availability = "probing" | "ready" | "missing";

type PlayerValue = {
  track: Track;
  index: number;
  playing: boolean;
  muted: boolean;
  availability: Availability;
  /** Секунды. */
  time: number;
  duration: number;
  /** 0..100 */
  volume: number;
  select: (id: string) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  unmute: () => void;
};

const PlayerContext = createContext<PlayerValue | null>(null);

/** Скрипт iframe API грузим один раз на страницу. */
let apiPromise: Promise<YTApi> | null = null;

function loadYouTubeApi(): Promise<YTApi> {
  const known = (window as unknown as { YT?: YTApi }).YT;
  if (known?.Player) return Promise.resolve(known);

  if (!apiPromise) {
    apiPromise = new Promise<YTApi>((resolve, reject) => {
      const win = window as unknown as { YT?: YTApi; onYouTubeIframeAPIReady?: () => void };
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

function ytState(): YTApi["PlayerState"] | undefined {
  return (window as unknown as { YT?: YTApi }).YT?.PlayerState;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [availability, setAvailability] = useState<Availability>("probing");
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(70);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  // Актуальный индекс для колбэков iframe (ENDED -> следующий трек).
  const indexRef = useRef(0);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const track = playlist[index] ?? playlist[0];

  const call = useCallback((fn: (p: YTPlayerInstance) => void) => {
    const peer = playerRef.current;
    if (!peer) return;
    try {
      fn(peer);
    } catch {
      setAvailability("missing");
    }
  }, []);

  /** Переключение трека. autoplay — если до этого играло или пользователь кликнул трек. */
  const goTo = useCallback(
    (nextIndex: number, autoplay: boolean) => {
      const wrapped = (nextIndex + playlist.length) % playlist.length;
      setIndex(wrapped);
      setTime(0);
      setDuration(0);
      setAvailability("probing");
      const id = playlist[wrapped].youtubeId;
      call((p) => (autoplay ? p.loadVideoById(id) : p.cueVideoById(id)));
    },
    [call],
  );

  // Рождение iframe: один раз, дальше только cue/load.
  useEffect(() => {
    let cancelled = false;
    let instance: YTPlayerInstance | null = null;
    let played = false;
    let watchdog = 0;

    loadYouTubeApi()
      .then((api) => {
        if (cancelled || !hostRef.current) return;
        instance = new api.Player(hostRef.current, {
          videoId: playlist[indexRef.current].youtubeId,
          // Exact size of the hidden host: a default 640x360 iframe spills
          // past the viewport and some browsers count it as scrollable page.
          width: 200,
          height: 200,
          // Privacy-enhanced mode: no YouTube cookies until a video plays.
          host: "https://www.youtube-nocookie.com",
          playerVars: { rel: 0 },
          events: {
            onReady: () => {
              if (cancelled) return;
              setAvailability("ready");
              try {
                instance?.setVolume(70);
                instance?.playVideo();
              } catch {
                // watchdog ниже уйдёт в немой режим
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
              const state = ytState();
              if (event.data === state?.PLAYING) {
                played = true;
                setAvailability("ready");
                setPlaying(true);
                try {
                  setMuted(instance?.isMuted() ?? false);
                  setDuration(instance?.getDuration() ?? 0);
                } catch {
                  setMuted(false);
                }
                return;
              }
              setPlaying(false);
              if (event.data === state?.CUED) setAvailability("ready");
              if (event.data === state?.ENDED) {
                const nextIndex = (indexRef.current + 1) % playlist.length;
                setIndex(nextIndex);
                setTime(0);
                try {
                  instance?.loadVideoById(playlist[nextIndex].youtubeId);
                } catch {
                  setAvailability("missing");
                }
              }
            },
            onError: () => {
              if (cancelled) return;
              setAvailability("missing");
              setPlaying(false);
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
  }, []);

  // Пока играет — опрашиваем позицию: событий прогресса у iframe API нет.
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      const peer = playerRef.current;
      if (!peer) return;
      try {
        setTime(peer.getCurrentTime());
        setDuration(peer.getDuration());
      } catch {
        // молча: следующий тик попробует снова
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [playing]);

  // Первый жест по странице размьючивает немой автоплей.
  useEffect(() => {
    const onGesture = () => {
      const peer = playerRef.current;
      try {
        if (peer?.isMuted()) {
          peer.unMute();
          peer.playVideo();
          setMuted(false);
        }
      } catch {
        // транспорт всё равно доступен вручную
      }
    };
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, []);

  const value = useMemo<PlayerValue>(() => {
    const play = () => call((p) => p.playVideo());
    const pause = () => {
      call((p) => p.pauseVideo());
      setPlaying(false);
    };
    return {
      track,
      index,
      playing,
      muted,
      availability,
      time,
      duration,
      volume,
      select: (id) => {
        const target = playlist.findIndex((item) => item.id === id);
        if (target >= 0) goTo(target, true);
      },
      play,
      pause,
      toggle: () => (playing ? pause() : play()),
      next: () => goTo(index + 1, playing),
      prev: () => goTo(index - 1, playing),
      seek: (seconds) => {
        setTime(seconds);
        call((p) => p.seekTo(seconds, true));
      },
      setVolume: (next) => {
        const clamped = Math.max(0, Math.min(100, Math.round(next)));
        setVolumeState(clamped);
        call((p) => p.setVolume(clamped));
      },
      unmute: () => {
        call((p) => {
          p.unMute();
          p.playVideo();
        });
        setMuted(false);
      },
    };
  }, [track, index, playing, muted, availability, time, duration, volume, call, goTo]);

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {/* Хост iframe: звук идёт отсюда. 200×200 в углу экрана, прозрачный
          (display:none браузеры умеют глушить, opacity — нет). */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 overflow-hidden opacity-0"
        style={{ width: 200, height: 200, zIndex: -1, contain: "strict" }}
      >
        <div ref={hostRef} />
      </div>
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}

/** 83 -> "1:23" */
export function formatTime(seconds: number): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}
