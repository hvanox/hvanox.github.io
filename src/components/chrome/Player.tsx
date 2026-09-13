"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Square } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { dict } from "@/content/dict";
import { isLocalTrack, playlist, type Track } from "@/content/playlist";
import { cn } from "@/lib/utils";

/**
 * Winamp-подобный плеер поверх плейлиста из src/content/playlist.ts.
 *
 * Правила: никакого autoplay — звук стартует только с клика. Готовность
 * трека определяют события самого <audio> (onCanPlay/onError), а не HEAD:
 * внешние стримы не всегда отвечают на HEAD и не всегда отдают CORS.
 * Визуализатор (AnalyserNode) подключаем только для своих файлов: чужой
 * сервер без CORS-заголовков глушит звук в WebAudio-графе, поэтому стримы
 * играют напрямую, а канвас показывает статичную полосу. При
 * prefers-reduced-motion анимации нет вообще — тоже статичная полоса.
 */

type TrackState = "probing" | "ready" | "missing";

const btnClass =
  "grid size-7 shrink-0 place-items-center border border-chrome bg-void text-bone transition-transform hover:border-blood hover:text-blood active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-chrome disabled:hover:text-bone";

/**
 * Плавающий бар текста песни над плеером. Текст крутится бегущей строкой,
 * пока трек играет, на паузе — замирает (animation-play-state). Две копии
 * строки подряд: keyframes marquee едет на -50%, шов бесшовный. Скорость —
 * примерно 9 символов в секунду, чтобы успевать читать. Без текста песни
 * крутим название. При prefers-reduced-motion глобальное правило глушит
 * анимацию — бар становится статичным.
 */
function LyricsBar({
  track,
  playing,
  label,
}: {
  track: Track;
  playing: boolean;
  label: string;
}) {
  const text =
    track.lyrics.length > 0 ? track.lyrics.join(" ✦ ") : `${track.title} — ${track.artist}`;
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

  const [currentId, setCurrentId] = useState<string>(playlist[0]?.id ?? "");
  const current: Track | undefined = playlist.find((tr) => tr.id === currentId);
  const [state, setState] = useState<TrackState>("probing");
  const [playing, setPlaying] = useState(false);
  // Гидрация: сервер и первый рендер клиента обязаны совпасть попиксельно,
  // поэтому `disabled` включаем только после монтирования. До этого кнопки
  // выглядят активными, но onClick-гарды их игнорируют, а без JS они всё
  // равно inert — звук без клиента невозможен.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const binsRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const frameRef = useRef<number | null>(null);

  const disabled = !current || state !== "ready";
  /** До монтирования — всегда enabled: иначе SSR и клиент разъедутся (см. выше). */
  const buttonDisabled = mounted && disabled;

  const stopVisualizer = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  // Смена трека: гасим звук и начинаем зондировать новый.
  const select = useCallback(
    (id: string) => {
      audioRef.current?.pause();
      setPlaying(false);
      stopVisualizer();
      setCurrentId(id);
      setState("probing");
    },
    [stopVisualizer],
  );

  /** Канвас в device pixels: иначе бары мылятся на retina. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const bloodColor = useCallback(
    () =>
      getComputedStyle(document.documentElement).getPropertyValue("--color-blood").trim() ||
      "currentColor",
    [],
  );

  /** Статичная полоса — состояние покоя, стримы и режим reduced-motion. */
  const drawStatic = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx2d = canvas?.getContext("2d");
    if (!canvas || !ctx2d) return;

    ctx2d.clearRect(0, 0, canvas.width, canvas.height);
    ctx2d.fillStyle = bloodColor();
    const barHeight = Math.max(2, Math.round(canvas.height * 0.18));
    ctx2d.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);
  }, [bloodColor]);

  const runVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const ctx2d = canvas?.getContext("2d");
    if (!canvas || !analyser || !ctx2d) return;

    if (!binsRef.current || binsRef.current.length !== analyser.frequencyBinCount) {
      binsRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
    }
    const bins = binsRef.current;

    const paint = () => {
      analyser.getByteFrequencyData(bins);
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      ctx2d.fillStyle = bloodColor();

      const count = 28;
      const gap = Math.max(1, Math.round(canvas.width * 0.004));
      const barWidth = (canvas.width - gap * (count - 1)) / count;
      const step = Math.floor(bins.length / count) || 1;

      for (let i = 0; i < count; i += 1) {
        const value = bins[i * step] / 255;
        const height = Math.max(2, value * canvas.height);
        ctx2d.fillRect(
          i * (barWidth + gap),
          canvas.height - height,
          barWidth,
          height,
        );
      }

      frameRef.current = requestAnimationFrame(paint);
    };

    paint();
  }, [bloodColor]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !current || state !== "ready") return;

    // Проверяем матч-медиа сами: CSS-правило до canvas не достаёт.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Граф только для своих файлов: стрим без CORS в нём глохнет.
    const withGraph = !reduced && isLocalTrack(current.src);

    try {
      if (withGraph) {
        // Граф строим один раз: createMediaElementSource на элемент — единожды.
        if (!ctxRef.current) {
          const AudioCtor =
            window.AudioContext ??
            (window as unknown as { webkitAudioContext?: typeof AudioContext })
              .webkitAudioContext;
          if (AudioCtor) {
            const audioCtx = new AudioCtor();
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 128;
            const source = audioCtx.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioCtx.destination);

            ctxRef.current = audioCtx;
            analyserRef.current = analyser;
          }
        }
        // После возврата с паузы контекст может быть suspended.
        if (ctxRef.current?.state === "suspended") await ctxRef.current.resume();
      }

      await audio.play();
      setPlaying(true);

      if (withGraph && analyserRef.current) runVisualizer();
      else {
        stopVisualizer();
        drawStatic();
      }
    } catch {
      // Воспроизведение отклонено — честно помечаем трек битым.
      setState("missing");
      setPlaying(false);
      stopVisualizer();
    }
  }, [current, state, drawStatic, runVisualizer, stopVisualizer]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
    stopVisualizer();
    drawStatic();
  }, [drawStatic, stopVisualizer]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setPlaying(false);
    stopVisualizer();
    drawStatic();
  }, [drawStatic, stopVisualizer]);

  // Покой рисуем сразу, как только знаем, что трек готов.
  useEffect(() => {
    if (state === "ready" && !playing) drawStatic();
  }, [state, playing, drawStatic]);

  useEffect(
    () => () => {
      stopVisualizer();
      void ctxRef.current?.close();
    },
    [stopVisualizer],
  );

  if (!current) {
    return (
      <p className="font-pixel text-[9px] tracking-[0.06em] text-bone-dim uppercase">
        {t(dict.player.silence)}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <LyricsBar track={current} playing={playing} label={t(dict.player.lyrics)} />

      <audio
        key={current.id}
        ref={audioRef}
        src={current.src}
        loop={current.loop}
        preload="metadata"
        crossOrigin="anonymous"
        onCanPlay={() => setState("ready")}
        onError={() => {
          setState("missing");
          setPlaying(false);
          stopVisualizer();
        }}
        onEnded={stop}
      />

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="h-12 w-full border border-blood-dim bg-void-deep"
      />

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
          {state === "missing" ? (
            t(dict.player.trackUnplayable)
          ) : (
            <>
              {current.title} — {current.artist}
            </>
          )}
        </p>
      </div>

      {/* Подпись автора со ссылкой — требование лицензии piapro. */}
      <a
        href={current.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-fit font-pixel text-[9px] tracking-[0.06em] text-bone-dim uppercase hover:text-blood"
      >
        {t(dict.player.viaPiapro)}: {current.artist} ↗
      </a>

      {playlist.length > 1 ? (
        <div>
          <p className="mb-1 font-pixel text-[9px] tracking-[0.06em] text-bone-dim uppercase">
            {t(dict.player.tracklist)}
          </p>
          <ol className="flex flex-col">
            {playlist.map((track, index) => {
              const active = track.id === currentId;
              return (
                <li key={track.id}>
                  <button
                    type="button"
                    onClick={() => select(track.id)}
                    aria-current={active}
                    className={cn(
                      "flex w-full items-baseline gap-2 px-1 py-0.5 text-left font-pixel text-[9px] tracking-[0.04em] uppercase transition-colors",
                      active ? "bg-blood text-bone" : "text-bone-dim hover:bg-void-deep hover:text-cyan",
                    )}
                  >
                    <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1 truncate">
                      {track.title} — {track.artist}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
