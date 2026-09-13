"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Square } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { dict } from "@/content/dict";

/**
 * Winamp-подобный плеер под один локальный трек.
 *
 * Правила: никакого autoplay — звук стартует только с клика. Если файла нет
 * (HEAD не ок, или <audio> ругнулся) — показываем dict.player.silence и
 * гасим кнопки. Визуализатор рисуется из AnalyserNode и живёт только во время
 * воспроизведения; при prefers-reduced-motion вместо анимации статичная полоса.
 */

const TRACK_SRC = "/audio/track.mp3";

type Availability = "probing" | "ready" | "missing";

export function Player() {
  const { t } = useI18n();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const binsRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const frameRef = useRef<number | null>(null);

  const [availability, setAvailability] = useState<Availability>("probing");
  const [playing, setPlaying] = useState(false);

  const disabled = availability !== "ready";

  // Есть ли вообще файл. На статическом хостинге 404 — нормальный ответ,
  // поэтому это не ошибка, а ветка «тишина».
  useEffect(() => {
    const abort = new AbortController();

    fetch(TRACK_SRC, { method: "HEAD", signal: abort.signal })
      .then((res) => setAvailability(res.ok ? "ready" : "missing"))
      .catch(() => {
        if (!abort.signal.aborted) setAvailability("missing");
      });

    return () => abort.abort();
  }, []);

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

  /** Статичная полоса — состояние покоя и режим reduced-motion. */
  const drawStatic = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx2d = canvas?.getContext("2d");
    if (!canvas || !ctx2d) return;

    ctx2d.clearRect(0, 0, canvas.width, canvas.height);
    ctx2d.fillStyle = bloodColor();
    const barHeight = Math.max(2, Math.round(canvas.height * 0.18));
    ctx2d.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);
  }, [bloodColor]);

  const stopVisualizer = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

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
    if (!audio || disabled) return;

    // Проверяем матч-медиа сами: CSS-правило до canvas не достаёт.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    try {
      if (!reduced) {
        // Графа строим один раз: createMediaElementSource на элемент — единожды.
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
            sourceRef.current = source;
          }
        }
        // После возврата с паузы контекст может быть suspended.
        if (ctxRef.current?.state === "suspended") await ctxRef.current.resume();
      }

      await audio.play();
      setPlaying(true);

      if (reduced || !analyserRef.current) drawStatic();
      else runVisualizer();
    } catch {
      // Файл битый или воспроизведение отклонено — честно уходим в тишину.
      setAvailability("missing");
      setPlaying(false);
      stopVisualizer();
    }
  }, [disabled, drawStatic, runVisualizer, stopVisualizer]);

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

  // Покой рисуем сразу, как только знаем, что трек есть.
  useEffect(() => {
    if (availability === "ready" && !playing) drawStatic();
  }, [availability, playing, drawStatic]);

  useEffect(
    () => () => {
      stopVisualizer();
      void ctxRef.current?.close();
    },
    [stopVisualizer],
  );

  return (
    <div className="flex flex-col gap-2">
      <audio
        ref={audioRef}
        src={TRACK_SRC}
        preload="none"
        onEnded={stop}
        onError={() => {
          setAvailability("missing");
          setPlaying(false);
          stopVisualizer();
        }}
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
          disabled={disabled}
          aria-label={playing ? t(dict.player.pause) : t(dict.player.play)}
          className="grid size-7 place-items-center border border-chrome bg-void text-bone transition-transform hover:border-blood hover:text-blood active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-chrome disabled:hover:text-bone"
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
          disabled={disabled}
          aria-label={t(dict.player.stop)}
          className="grid size-7 place-items-center border border-chrome bg-void text-bone transition-transform hover:border-blood hover:text-blood active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-chrome disabled:hover:text-bone"
        >
          <Square aria-hidden="true" className="size-3.5" strokeWidth={2} />
        </button>

        <p className="ml-1 min-w-0 flex-1 truncate font-pixel text-[9px] tracking-[0.06em] text-bone-dim uppercase">
          {availability === "ready" ? "track.mp3" : t(dict.player.silence)}
        </p>
      </div>
    </div>
  );
}
