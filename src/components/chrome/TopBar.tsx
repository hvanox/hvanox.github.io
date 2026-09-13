"use client";

import { Marquee } from "@/components/chrome/Marquee";
import { usePlayerState } from "@/lib/player-state";

/**
 * Верхняя бегущая строка. Пока плеер играет — крутит текст текущей песни
 * (название + автор + строки), иначе — обычные слоганы и ачивки.
 * Скорость подстраиваем под длину: ~9 символов в секунду, минимум минута
 * на круг, чтобы длинные тексты успевали читаться.
 */

export function TopBar({ fallback }: { fallback: string[] }) {
  const { track, playing } = usePlayerState();

  if (playing) {
    const body =
      track.lyrics.length > 0 ? track.lyrics.join(" ✦ ") : `${track.title} — ${track.artist}`;
    const text = `${track.title} — ${track.artist} ✦ ${body}`;
    return <Marquee items={[text]} speed={Math.max(60, Math.round(text.length / 9))} />;
  }

  return <Marquee items={fallback} />;
}
