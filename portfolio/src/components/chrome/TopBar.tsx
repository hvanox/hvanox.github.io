"use client";

import { Marquee } from "@/components/chrome/Marquee";
import { usePlayerState } from "@/lib/player-state";

/**
 * Верхняя бегущая строка сайта. Это та же самая полоса, что была:
 * слоганы заменены текстом текущей песни (название + автор + строки).
 * Скорость подстраиваем под длину: ~9 символов в секунду, минимум минута
 * на круг, чтобы длинные тексты успевали читаться.
 */

export function TopBar() {
  const { track } = usePlayerState();

  const body =
    track.lyrics.length > 0 ? track.lyrics.join(" ✦ ") : `${track.title} — ${track.artist}`;
  const text = `${track.title} — ${track.artist} ✦ ${body}`;

  return <Marquee items={[text]} speed={Math.max(60, Math.round(text.length / 9))} />;
}
