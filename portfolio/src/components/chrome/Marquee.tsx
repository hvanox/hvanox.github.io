"use client";

import { cn } from "@/lib/utils";

/**
 * Бегущая строка на CSS-анимации. Тег <marquee> не используется: он удалён
 * из стандарта. Список дублируется дважды, дорожка едет на -50% —
 * поэтому шов не виден. `prefers-reduced-motion` гасит движение
 * глобальным правилом в globals.css.
 */

type MarqueeProps = {
  items: string[];
  reverse?: boolean;
  /** Длительность одного прохода в секундах. */
  speed?: number;
  className?: string;
};

export function Marquee({ items, reverse = false, speed, className }: MarqueeProps) {
  // Дублируем список: вторая копия закрывает шов в момент перескока.
  const track = [...items, ...items];

  return (
    <div
      className={cn(
        "relative flex overflow-hidden border-y border-blood-dim bg-void-deep py-1",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-max shrink-0 items-center gap-6 pr-6 whitespace-nowrap",
          reverse ? "animate-marquee-rev" : "animate-marquee",
        )}
        style={speed ? { animationDuration: `${speed}s` } : undefined}
      >
        {track.map((item, i) => (
          <span
            key={`${item}-${i}`}
            // Вторая половина — визуальный дубль, скринридеру она не нужна.
            aria-hidden={i >= items.length ? "true" : undefined}
            className="flex items-center gap-6 font-pixel text-[11px] tracking-[0.12em] text-bone uppercase"
          >
            {item}
            <span aria-hidden="true" className="text-blood">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
