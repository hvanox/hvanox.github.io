"use client";

/**
 * Окно плеера по экрану «UTAUloid»: розовый фон, шеврон-свернуть,
 * «UTAU★UTAU★» контуром, обложка, строка иконок, прогресс и транспорт.
 * Звук — в PlayerProvider, окно только управляет: закрыл — музыка играет.
 */

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Heart, ListMusic, Pause, Play, Plus, SkipBack, SkipForward } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { dict } from "@/content/dict";
import { playlist, watchUrl } from "@/content/playlist";
import { useI18n } from "@/lib/i18n";
import { formatTime, usePlayer } from "@/lib/player";
import { cn } from "@/lib/utils";

type PlayerDialogValue = { open: boolean; setOpen: (open: boolean) => void };

const PlayerDialogContext = createContext<PlayerDialogValue | null>(null);

export function usePlayerDialog(): PlayerDialogValue {
  const ctx = useContext(PlayerDialogContext);
  if (!ctx) throw new Error("usePlayerDialog must be used inside <PlayerDialogProvider>");
  return ctx;
}

export function PlayerDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return (
    <PlayerDialogContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <PlayerWindow />
      </Dialog>
    </PlayerDialogContext.Provider>
  );
}

const iconBtn =
  "grid size-10 place-items-center rounded-full text-sakura-deep transition-[background-color,transform] hover:bg-sakura-hi/60 active:scale-95 disabled:opacity-40";

function PlayerWindow() {
  const { t } = useI18n();
  const player = usePlayer();
  const { track, playing, time, duration, availability, muted } = player;
  const [showList, setShowList] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const progress = duration > 0 ? Math.min(1, time / duration) : 0;

  return (
    <DialogContent className="w-[min(94vw,420px)] gap-0 overflow-hidden rounded-[18px] border-2 border-sakura-deep bg-sakura p-0 text-sakura-deep shadow-[6px_6px_0_0_var(--color-night)]">
      <div className="flex items-center justify-between px-3 pt-2">
        <DialogClose className={iconBtn} aria-label={t(dict.player.close)}>
          <ChevronDown aria-hidden="true" className="size-6" strokeWidth={2.4} />
        </DialogClose>
        <a
          href={watchUrl(track)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full px-3 py-1 font-mono text-xs underline-offset-2 hover:underline"
        >
          youtube ↗<span className="sr-only"> {t(dict.player.watch)}</span>
        </a>
      </div>

      <DialogTitle className="px-5 pt-1 font-display text-[2.1rem] leading-none font-black tracking-tight">
        <span aria-hidden="true" className="text-stroke-snow">
          UTAU★UTAU★
        </span>
        <span className="sr-only">{track.title}</span>
      </DialogTitle>

      <div className="relative mx-5 mt-3 aspect-[27/25] overflow-hidden rounded-lg">
        {showList ? (
          <ol className="absolute inset-0 flex flex-col gap-1 overflow-y-auto bg-sakura-hi p-2">
            {playlist.map((item, i) => {
              const active = item.id === track.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={active}
                    onClick={() => {
                      player.select(item.id);
                      setShowList(false);
                    }}
                    className={cn(
                      "flex w-full items-baseline gap-3 rounded-md px-3 py-2 text-left transition-colors",
                      active ? "bg-sakura-deep text-snow" : "hover:bg-sakura/60",
                    )}
                  >
                    <span className="font-mono text-xs tabular-nums opacity-70">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-jp text-sm font-bold">{item.title}</span>
                      <span className="block truncate font-jp text-xs opacity-80">{item.artist}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- статический экспорт
          <img
            src="/board/utau-cover.webp"
            alt=""
            width={540}
            height={500}
            className="size-full object-cover"
          />
        )}
      </div>

      <DialogDescription className="px-5 pt-3 font-jp text-sm leading-snug text-sakura-deep">
        <span className="block truncate text-base font-bold">{track.title}</span>
        <span className="block truncate opacity-80">
          {availability === "missing" ? t(dict.player.unplayable) : track.artist}
        </span>
      </DialogDescription>

      <div className="flex items-center justify-between px-3 pt-1">
        <button
          type="button"
          className={cn(iconBtn, showList && "bg-sakura-hi")}
          aria-label={t(dict.player.playlist)}
          aria-pressed={showList}
          onClick={() => setShowList((v) => !v)}
        >
          <ListMusic aria-hidden="true" className="size-6" strokeWidth={2.2} />
        </button>
        <button
          type="button"
          className={iconBtn}
          aria-label={t(dict.player.like)}
          aria-pressed={Boolean(liked[track.id])}
          onClick={() => setLiked((prev) => ({ ...prev, [track.id]: !prev[track.id] }))}
        >
          <Heart
            aria-hidden="true"
            className="size-6"
            strokeWidth={2.2}
            fill={liked[track.id] ? "currentColor" : "none"}
          />
        </button>
        <a
          href={watchUrl(track)}
          target="_blank"
          rel="noopener noreferrer"
          className={iconBtn}
          aria-label={t(dict.player.watch)}
        >
          <Plus aria-hidden="true" className="size-6" strokeWidth={2.2} />
        </a>
      </div>

      <div className="px-5 pt-2">
        <label className="relative block h-5">
          <span className="sr-only">{t(dict.player.progress)}</span>
          <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-snow" />
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-0 h-[3px] -translate-y-1/2 rounded-full bg-sakura-deep"
            style={{ width: `${progress * 100}%` }}
          />
          <span
            aria-hidden="true"
            className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sakura-deep"
            style={{ left: `${progress * 100}%` }}
          />
          <input
            type="range"
            min={0}
            max={Math.max(1, Math.round(duration))}
            value={Math.round(time)}
            disabled={duration <= 0}
            aria-valuetext={`${formatTime(time)} / ${formatTime(duration)}`}
            onChange={(event) => player.seek(Number(event.target.value))}
            className="absolute inset-0 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />
        </label>
        <div className="flex justify-between font-sans text-sm font-semibold tabular-nums">
          <span>{formatTime(time)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-8 px-5 pt-1 pb-5">
        <button type="button" className={iconBtn} aria-label={t(dict.player.prev)} onClick={player.prev}>
          <SkipBack aria-hidden="true" className="size-5" fill="currentColor" />
        </button>
        <button
          type="button"
          className={cn(iconBtn, "size-14")}
          aria-label={playing ? t(dict.player.pause) : t(dict.player.play)}
          onClick={player.toggle}
          disabled={availability === "missing"}
        >
          {playing ? (
            <Pause aria-hidden="true" className="size-8" fill="currentColor" />
          ) : (
            <Play aria-hidden="true" className="size-8 translate-x-0.5" fill="currentColor" />
          )}
        </button>
        <button type="button" className={iconBtn} aria-label={t(dict.player.next)} onClick={player.next}>
          <SkipForward aria-hidden="true" className="size-5" fill="currentColor" />
        </button>
      </div>

      {muted && playing ? (
        <button
          type="button"
          onClick={player.unmute}
          className="animate-blink mx-5 mb-4 rounded-full bg-sakura-deep px-4 py-2 font-mono text-xs text-snow"
        >
          [ {t(dict.player.unmute)} ]
        </button>
      ) : null}
    </DialogContent>
  );
}
