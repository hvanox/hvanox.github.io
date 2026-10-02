"use client";

/**
 * Примитивы борда. Фон — сам эдит reathaa (public/board/board.webp),
 * всё живое кладётся поверх его панелей. Координаты — в пикселях исходника
 * 736×414 (`[x, y, w, h]`), те же, что в scripts/clean-board.py.
 */

import { useLayoutEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const BOARD_W = 736;
export const BOARD_H = 414;

/**
 * n пикселей исходника -> CSS-длина (масштабируется вместе с бордом).
 * --fit — множитель автоподгонки: если текст не влез в рамку панели
 * (длинный русский перевод), useFit уменьшает его у контейнера.
 */
export function u(n: number): string {
  return `calc(var(--u) * ${n} * var(--fit, 1))`;
}

/** Длина без автоподгонки: для рамок и отступов, которые не должны сжиматься. */
export function px(n: number): string {
  return `calc(var(--u) * ${n})`;
}

/**
 * Текст вылез за рамку? По ширине — строго; по высоте — с запасом 20%:
 * хвосты букв (курсив, «у», «р») законно выходят за строку.
 * sr-only-подписи (1×1 px) не считаются.
 */
function overflows(root: HTMLElement): boolean {
  const nodes = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];
  return nodes.some(
    (el) =>
      el.clientWidth > 2 &&
      !el.classList.contains("sr-only") &&
      (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight * 1.2 + 1),
  );
}

/**
 * Ужимает шрифт содержимого, пока оно не влезет в рамку: перебирает --fit
 * от 1 вниз. Пересчитывается при смене текста (язык, трек) и размера борда.
 */
export function useFit<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    let frame = 0;

    const fit = () => {
      el.style.setProperty("--fit", "1");
      let scale = 1;
      while (scale > 0.55 && overflows(el)) {
        scale = Math.round((scale - 0.04) * 100) / 100;
        el.style.setProperty("--fit", String(scale));
      }
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };

    fit();
    const resize = new ResizeObserver(schedule);
    resize.observe(el);
    const mutation = new MutationObserver(schedule);
    mutation.observe(el, { childList: true, subtree: true, characterData: true });
    // Шрифты догружаются после первого замера — перемеряем.
    document.fonts?.ready.then(schedule).catch(() => {});

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
    };
  }, [enabled]);

  return ref;
}

/** [x, y, w, h] на холсте 736×414. */
export type Box = readonly [number, number, number, number];

export function boxStyle([x, y, w, h]: Box): CSSProperties {
  return {
    position: "absolute",
    left: `${(x / BOARD_W) * 100}%`,
    top: `${(y / BOARD_H) * 100}%`,
    width: `${(w / BOARD_W) * 100}%`,
    height: `${(h / BOARD_H) * 100}%`,
  };
}

/** Элемент, положенный на прямоугольник картинки. */
export function At({
  box,
  as: Tag = "div",
  fit = true,
  className,
  style,
  children,
  ...rest
}: {
  box: Box;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
  lang?: string;
  "aria-label"?: string;
  "aria-live"?: "polite" | "off";
  "aria-hidden"?: boolean;
  /** false — не ужимать (каллиграфия: её росчерки законно вылезают за строку). */
  fit?: boolean;
}) {
  const ref = useFit<HTMLElement>(fit);
  return (
    <Tag {...rest} ref={ref} className={cn("overflow-hidden", className)} style={{ ...boxStyle(box), ...style }}>
      {children}
    </Tag>
  );
}

/**
 * Прозрачная кнопка поверх нарисованной на картинке кнопки/иконки:
 * подсветка при наведении и видимый фокус, сама картинка не перекрывается.
 */
const hotspot =
  "overflow-hidden cursor-pointer transition-[background-color] hover:bg-snow/20 active:bg-snow/30 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-snow";

export function Hotspot({
  box,
  label,
  onClick,
  href,
  pressed,
  radius = 2,
  fit = true,
  className,
  style,
  children,
}: {
  box: Box;
  label: string;
  onClick?: () => void;
  href?: string;
  pressed?: boolean;
  /** Скругление в пикселях исходника, чтобы подсветка повторяла форму. */
  radius?: number | "full";
  fit?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const ref = useFit<HTMLAnchorElement & HTMLButtonElement>(fit);
  const merged: CSSProperties = {
    ...boxStyle(box),
    borderRadius: radius === "full" ? 9999 : px(radius),
    ...style,
  };
  if (href) {
    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        title={label}
        className={cn(hotspot, className)}
        style={merged}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(hotspot, className)}
      style={merged}
    >
      {children}
    </button>
  );
}
