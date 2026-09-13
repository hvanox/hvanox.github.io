"use client";

/**
 * Общее состояние плеера: текущий трек и факт воспроизведения.
 * Нужно верхней бегущей строке (TopBar): пока играет — крутит текст
 * текущей песни, иначе — обычные слоганы. Сам YouTube-плеер живёт
 * в Player и сюда же сообщает о смене трека/паузе.
 */

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { playlist, type Track } from "@/content/playlist";

type PlayerStateValue = {
  track: Track;
  playing: boolean;
  selectTrack: (id: string) => void;
  setPlaying: (playing: boolean) => void;
};

const PlayerStateContext = createContext<PlayerStateValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentId, setCurrentId] = useState<string>(playlist[0]?.id ?? "");
  const [playing, setPlaying] = useState(false);

  const value = useMemo<PlayerStateValue>(() => {
    const track = playlist.find((item) => item.id === currentId) ?? playlist[0];
    return {
      track,
      playing,
      selectTrack: (id: string) => {
        setCurrentId(id);
        setPlaying(false);
      },
      setPlaying,
    };
  }, [currentId, playing]);

  return <PlayerStateContext.Provider value={value}>{children}</PlayerStateContext.Provider>;
}

export function usePlayerState(): PlayerStateValue {
  const ctx = useContext(PlayerStateContext);
  if (!ctx) throw new Error("usePlayerState must be used inside <PlayerProvider>");
  return ctx;
}
