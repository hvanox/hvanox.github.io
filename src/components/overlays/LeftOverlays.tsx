"use client";

/**
 * Оверлеи левой половины эдита: карточка «Lucky Girl», STEAMPUNK,
 * «User Interface», Songs, «"Game" of Gear», пилюли «Date», часы,
 * «Loading» и папка «Height / Blood Type / Status».
 */

import { useState } from "react";
import { At, Hotspot, px, u } from "@/components/board/primitives";
import { usePlayerDialog } from "@/components/player/PlayerDialog";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { dict } from "@/content/dict";
import { playlist } from "@/content/playlist";
import { profile, stack } from "@/content/profile";
import { useI18n } from "@/lib/i18n";
import { formatTime, usePlayer } from "@/lib/player";
import { cn } from "@/lib/utils";
import { ageAt, daysSince, useNow } from "@/lib/use-now";
import { useQuery } from "@tanstack/react-query";

/* ───────────────────────── «Lucky Girl» ───────────────────────── */

export function AboutOverlay() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <At box={[115, 20, 71, 12]} as="h1" className="grid place-items-center">
        <span className="sr-only">{profile.handle} — </span>
        <span className="truncate font-sans font-bold text-type-dark" style={{ fontSize: u(7.4), letterSpacing: "0.01em" }}>
          {t(profile.role)}
        </span>
      </At>

      <At box={[104, 38, 93, 28]} className="grid place-items-center">
        <p className="text-center font-sans font-bold text-type-soft" style={{ fontSize: u(4.6), lineHeight: 1.3, letterSpacing: "0.02em" }}>
          {t(dict.about.short)}
        </p>
      </At>

      <Hotspot box={[108, 145, 84, 25]} label={t(dict.about.more)} onClick={() => setOpen(true)} fit={false} className="grid place-items-center">
        <span className="font-script text-type-soft" style={{ fontSize: u(25), lineHeight: 1 }}>
          {profile.handle}
        </span>
      </Hotspot>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[min(92vw,520px)] gap-3 p-5">
          <DialogTitle className="font-mono">{t(dict.about.title)}</DialogTitle>
          <DialogDescription className="font-mono text-sm leading-relaxed text-ink">{t(dict.about.body)}</DialogDescription>
          <p className="font-script text-2xl text-plum">{t(dict.about.note)}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ───────────────────────── STEAMPUNK → стек ───────────────────────── */

export function StackOverlay() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const total = stack.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <>
      <At box={[214, 14, 92, 8]} className="flex items-center justify-between font-mono text-type-dark uppercase" style={{ fontSize: u(4.2) }}>
        <span className="font-semibold italic">{t(dict.stack.title)}</span>
        <span>___@hvano</span>
        <span className="tabular-nums">({total})</span>
      </At>

      <At box={[263, 25, 40, 15]} className="font-sans font-bold text-type-dark" style={{ fontSize: u(3.3), lineHeight: 1.25 }}>
        {stack.slice(0, 3).map((group) => (
          <p key={group.group} className="truncate">
            {group.items.join(" ")}
          </p>
        ))}
      </At>

      <Hotspot box={[212, 12, 92, 54]} label={t(dict.stack.open)} onClick={() => setOpen(true)} radius={2} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[min(92vw,460px)] gap-3 p-5">
          <DialogTitle className="font-mono uppercase">{t(dict.stack.title)}</DialogTitle>
          <DialogDescription className="sr-only">{t(dict.stack.open)}</DialogDescription>
          <dl className="m-0 grid gap-2 font-mono text-sm">
            {stack.map((group) => (
              <div key={group.group} className="grid grid-cols-[88px_1fr] gap-3">
                <dt className="font-semibold">{t(dict.stack[group.group])}</dt>
                <dd className="m-0">{group.items.join(" · ")}</dd>
              </div>
            ))}
          </dl>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ───────────────────────── «User Interface» → GitHub ───────────────────────── */

const login = profile.contacts.github.href.replace(/^https:\/\/github\.com\//, "");

type GithubUser = { public_repos: number; followers: number; created_at: string };

async function fetchGithubUser(): Promise<GithubUser> {
  const res = await fetch(`https://api.github.com/users/${login}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`github: ${res.status}`);
  return (await res.json()) as GithubUser;
}

export function GithubOverlay() {
  const { t } = useI18n();
  const { data, isError } = useQuery({ queryKey: ["github", login], queryFn: fetchGithubUser });

  // Числа не выдумываем: пока грузится — точки, ошибка — честная строка.
  const text = isError
    ? t(dict.github.unavailable)
    : data
      ? `${data.public_repos} ${t(dict.github.repos)} · ${data.followers} ${t(dict.github.followers)}`
      : "· · ·";

  return (
    <>
      <At box={[220, 151, 56, 11]} className="flex items-center" aria-live="polite">
        <span className="truncate font-sans text-type-dark" style={{ fontSize: u(5.6), paddingLeft: u(2) }}>
          {text}
        </span>
      </At>
      <Hotspot box={[214, 81, 68, 60]} label={t(dict.github.open)} href={profile.contacts.github.href} radius={6} />
    </>
  );
}

/* ───────────────────────── «Aisana Songs» → мини-плеер ───────────────────────── */

/** Пилюли на картинке: 6 штук, по одной на трек. */
const PILLS = [
  [18, 332, 26, 11],
  [58, 332, 40, 11],
  [52, 348, 27, 11],
  [18, 365, 26, 11],
  [58, 365, 40, 11],
  [52, 381, 27, 11],
] as const;

export function SongsOverlay() {
  const { t } = useI18n();
  const { setOpen } = usePlayerDialog();
  const { track, time, duration, select } = usePlayer();

  // Строчку текста подбираем пропорционально позиции в треке — тайм-кодов нет.
  const lines = track.lyrics;
  const at = lines.length > 0 && duration > 0 ? Math.min(lines.length - 1, Math.floor((time / duration) * lines.length)) : 0;
  const visible = lines.length > 0 ? lines.slice(at, at + 4) : [track.title, track.artist];

  return (
    <>
      <At box={[17, 196, 75, 15]} as="h2" fit={false} className="flex items-baseline justify-around font-script font-normal text-type-soft" style={{ fontSize: u(11), lineHeight: 1.1 }}>
        <span>Teto</span>
        <span>{t(dict.player.songs)}</span>
      </At>

      <Hotspot box={[25, 202, 66, 74]} label={t(dict.player.open)} onClick={() => setOpen(true)} radius="full" />

      <At box={[21, 290, 76, 37]} className="flex flex-col justify-center text-center font-sans text-type-soft" aria-live="polite">
        {visible.map((line, i) => (
          <p key={`${at}-${i}`} className={cn("truncate", i > 0 && "opacity-60")} style={{ fontSize: u(4), lineHeight: 1.5 }}>
            {line}
          </p>
        ))}
      </At>

      {playlist.map((item, i) => {
        const active = item.id === track.id;
        return (
          <Hotspot
            key={item.id}
            box={PILLS[i]}
            label={`${item.title} — ${item.artist}`}
            pressed={active}
            onClick={() => select(item.id)}
            radius={1}
            className="grid place-items-center"
          >
            <span
              className={cn("truncate font-sans text-type-dark", active && "font-bold underline decoration-type-dark/60 underline-offset-2")}
              style={{ fontSize: u(4), paddingInline: px(1.5) }}
            >
              {/* В пилюлю — без пояснения в скобках, полное имя в aria-label. */}
              {item.title.replace(/\s*\(.*\)$/, "")}
            </span>
          </Hotspot>
        );
      })}
    </>
  );
}

/* ───────────────────────── «"Game" of Gear» → дни на Земле ───────────────────────── */

export function GearOverlay() {
  const { locale, t } = useI18n();
  const now = useNow(60_000);
  const days = now ? daysSince(profile.born, now).toLocaleString(locale) : "····";

  return (
    <At box={[109, 191, 49, 27]} className="flex flex-col justify-center text-type-dark">
      <span className="font-sans tabular-nums" style={{ fontSize: u(10.5), lineHeight: 1 }}>
        &ldquo;{days}&rdquo;
      </span>
      <span className="truncate font-sans" style={{ fontSize: u(5), marginTop: u(1.5) }}>
        __ {t(dict.profile.days)}
      </span>
    </At>
  );
}

/* ───────────────────────── пилюли «Date / Date» ───────────────────────── */

export function BarsOverlay() {
  const { t } = useI18n();
  const { time, duration, seek, volume, setVolume, availability } = usePlayer();
  const disabled = availability === "missing" || duration <= 0;

  return (
    <>
      <VerticalRange
        box={[107, 231, 32, 98]}
        label={t(dict.player.progress)}
        value={Math.round(time)}
        max={Math.max(1, Math.round(duration))}
        valueText={`${formatTime(time)} / ${formatTime(duration)}`}
        onChange={seek}
        disabled={disabled}
      />
      <VerticalRange
        box={[154, 231, 32, 98]}
        label={t(dict.player.volume)}
        value={volume}
        max={100}
        valueText={`${volume}%`}
        onChange={setVolume}
      />
      <At box={[109, 338, 28, 14]} className="grid place-items-center font-sans text-type-muted" style={{ fontSize: u(6.4) }}>
        {t(dict.player.track)}
      </At>
      <At box={[156, 338, 28, 14]} className="grid place-items-center font-sans text-type-muted" style={{ fontSize: u(6.4) }}>
        {t(dict.player.vol)}
      </At>
    </>
  );
}

function VerticalRange({
  box,
  label,
  value,
  max,
  valueText,
  onChange,
  disabled,
}: {
  box: readonly [number, number, number, number];
  label: string;
  value: number;
  max: number;
  valueText: string;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const fill = Math.min(1, value / max);
  return (
    <At box={box} as="label" className="group" style={{ borderRadius: px(12) }}>
      {/* Заливка в цвет нижней части пилюли, с зерном и мягким краем —
          как сжатая картинка вокруг, а не гладкий векторный прямоугольник. */}
      <span
        aria-hidden="true"
        className="grainy-fill absolute inset-x-0 bottom-0 transition-[height] duration-500 ease-linear"
        style={{ height: `${fill * 100}%` }}
      />
      <span className="sr-only">{label}</span>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        aria-valuetext={valueText}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="range-vertical absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
    </At>
  );
}

/* ───────────────────────── часы «[+] 6:30:00 PM» ───────────────────────── */

export function ClockOverlay() {
  const { locale, t } = useI18n();
  const now = useNow(1000);
  const [h12, setH12] = useState(true);

  const text = now
    ? now.toLocaleTimeString(h12 ? "en-US" : locale, { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: h12 })
    : "--:--:--";

  return (
    <>
      <Hotspot box={[109, 368, 31, 30]} label={t(dict.clock.toggle)} pressed={!h12} onClick={() => setH12((v) => !v)} className="grid place-items-center">
        <span className="font-sans text-type-light" style={{ fontSize: u(22), lineHeight: 1 }}>
          [+]
        </span>
      </Hotspot>
      <At box={[142, 366, 122, 34]} className="flex items-center" aria-label={t(dict.clock.label)}>
        <time
          dateTime={now?.toISOString()}
          className="font-sans whitespace-nowrap text-type-light tabular-nums"
          style={{ fontSize: u(19), lineHeight: 1 }}
          suppressHydrationWarning
        >
          {text}
        </time>
      </At>
    </>
  );
}

/* ───────────────────────── «Loading» + папка профиля ───────────────────────── */

export function ProfileOverlay() {
  const { t } = useI18n();
  const now = useNow(60_000);
  const { track, playing, time, duration } = usePlayer();
  const progress = duration > 0 ? Math.min(1, time / duration) : 0;
  const [year, month, day] = profile.born.split("-");

  const row = "flex items-center whitespace-nowrap font-sans text-type-soft";

  return (
    <>
      <At box={[208, 196, 56, 13]} className="flex items-center font-mono text-type-soft" style={{ fontSize: u(5.6), paddingInline: u(1) }}>
        <span className="truncate">
          {t(dict.profile.loading)} <span className="opacity-70">{track.title}</span>
        </span>
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 bg-type-soft/70 transition-[width] duration-500 ease-linear"
          style={{ height: px(1), width: `${progress * 100}%` }}
        />
      </At>

      <At box={[206, 256, 40, 17]} className={row} style={{ fontSize: u(8.4) }}>
        {t(dict.profile.age)} : {now ? ageAt(profile.born, now) : "··"}
      </At>
      <At box={[206, 281, 84, 16]} className={row} style={{ fontSize: u(8.4) }}>
        {t(dict.profile.born)} : {day}.{month}.{year}
      </At>
      <At box={[206, 305, 92, 18]} className={row} style={{ fontSize: u(8.4) }} aria-live="polite">
        {t(dict.profile.status)} : {playing ? t(dict.profile.listening) : t(dict.profile.alive)}
      </At>
    </>
  );
}
