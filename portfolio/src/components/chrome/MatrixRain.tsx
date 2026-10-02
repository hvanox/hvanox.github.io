"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Матричный дождь: катакану и цифры сыплет поверх фона, под контентом.
 * fixed + pointer-events-none, поэтому клики не перехватывает. Цвета —
 * только токены палитры (chrome/blood/cyan), тускло, чтобы не спорить
 * с текстом. При prefers-reduced-motion не стартует вообще, при скрытой
 * вкладке встаёт на паузу (visibilitychange). Без JS — просто нет слоя.
 */

const GLYPHS = "アイウエオカキクケコサシスセソタチツテト0123456789:#$*+=200";
const FONT_PX = 14;

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEnabled(false);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const style = getComputedStyle(document.documentElement);
    const palette = [
      style.getPropertyValue("--color-chrome").trim() || "#9aa7b4",
      style.getPropertyValue("--color-blood").trim() || "#eb0038",
      style.getPropertyValue("--color-cyan").trim() || "#00e5ff",
    ];

    let width = 0;
    let drops: { y: number; speed: number; color: string }[] = [];
    const seed = () => {
      width = window.innerWidth;
      canvas.width = width;
      canvas.height = window.innerHeight;
      const cols = Math.max(1, Math.floor(width / FONT_PX));
      drops = Array.from({ length: cols }, (_, i) => ({
        y: Math.random() * -40,
        speed: 0.25 + Math.random() * 0.6,
        color: palette[i % 7 === 0 ? 1 : i % 11 === 0 ? 2 : 0],
      }));
    };
    seed();

    let frame = 0;
    let running = true;
    const tick = () => {
      if (!running) return;
      // Гасим предыдущий кадр через destination-in: шлейф тает,
      // фон под канвасом не закрашивается.
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = "rgba(0, 0, 0, 0.88)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";
      ctx.font = `${FONT_PX}px monospace`;

      drops.forEach((drop, i) => {
        const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        ctx.fillStyle = drop.color;
        ctx.globalAlpha = 0.5;
        ctx.fillText(ch, i * FONT_PX, drop.y * FONT_PX);
        drop.y += drop.speed;
        if (drop.y * FONT_PX > canvas.height && Math.random() > 0.976) {
          drop.y = 0;
          drop.speed = 0.25 + Math.random() * 0.6;
        }
      });
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => seed();
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(frame);
      } else if (!running) {
        running = true;
        tick();
      }
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-30"
    />
  );
}
