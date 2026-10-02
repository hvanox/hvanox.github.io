"use client";

/**
 * Оверлеи правой половины эдита: GFX / Graphic Design, тумблеры On/Off,
 * пустой квадрат, колокольчик «Success!», «System Message», поле «Heaven»,
 * строки «Document of …» и окно «Virtual Picture.».
 */

import { Check, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import art from "@/content/art.json";
import { At, Hotspot, px, u } from "@/components/board/primitives";
import { usePlayerDialog } from "@/components/player/PlayerDialog";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { dict } from "@/content/dict";
import { achievements, experience, profile } from "@/content/profile";
import { updates } from "@/content/updates";
import { useI18n } from "@/lib/i18n";
import { useMotion } from "@/lib/motion";
import { usePlayer } from "@/lib/player";
import { useNow } from "@/lib/use-now";

/* ───────────────────────── GFX / Graphic Design → роль ───────────────────────── */

export function RoleOverlay() {
  const { t } = useI18n();
  return (
    <>
      <At box={[417, 46, 70, 32]} className="flex items-center" aria-hidden>
        <span className="font-display font-black text-type-dark italic" style={{ fontSize: u(24), lineHeight: 1, letterSpacing: "-0.03em" }}>
          API
        </span>
        <Zap className="text-type-dark" style={{ width: u(12), height: u(12), marginLeft: u(1), marginTop: u(10) }} fill="currentColor" strokeWidth={1} />
      </At>
      <At box={[417, 120, 75, 27]} className="flex flex-col text-type-dark">
        <h2 className="truncate font-display font-bold capitalize italic" style={{ fontSize: u(6.6), lineHeight: 1.25 }}>
          {t(profile.role)}
        </h2>
        <p className="font-display font-bold italic" style={{ fontSize: u(3.4), lineHeight: 1.3 }}>
          {t(dict.header.slogan)} / {t(profile.tagline)}
        </p>
      </At>
      <Hotspot box={[472, 152, 19, 17]} label={t(dict.contact.telegram)} href={profile.contacts.telegram.href} radius={2} />
    </>
  );
}

/* ───────────────────────── On / Off → язык и анимации ───────────────────────── */

export function TogglesOverlay() {
  const { locale, toggle, t } = useI18n();
  const { motion, setMotion } = useMotion();
  const label = "grid place-items-center font-sans font-bold text-type-light";

  return (
    <>
      <Hotspot box={[493, 104, 33, 16]} label={`${t(dict.settings.lang)}: ${locale.toUpperCase()}`} pressed={locale === "ru"} onClick={toggle} />
      <At box={[505, 107, 19, 11]} className={label} style={{ fontSize: u(6.6) }} aria-hidden>
        {locale.toUpperCase()}
      </At>

      <Hotspot
        box={[533, 104, 34, 16]}
        label={`${t(dict.settings.motion)}: ${motion ? t(dict.settings.on) : t(dict.settings.off)}`}
        pressed={motion}
        onClick={() => setMotion(!motion)}
      />
      <At box={[545, 107, 20, 11]} className={label} style={{ fontSize: u(6.6) }} aria-hidden>
        {motion ? "on" : "off"}
      </At>
    </>
  );
}

/* ───────────────────────── пустой квадрат → сейчас играет ───────────────────────── */

const BARS = [0.55, 0.9, 0.4, 0.75, 1, 0.5, 0.8, 0.35, 0.65];

export function NowPlayingOverlay() {
  const { t } = useI18n();
  const { track, playing } = usePlayer();
  const { setOpen } = usePlayerDialog();

  return (
    <Hotspot
      box={[497, 24, 61, 62]}
      label={`${t(dict.player.open)}: ${track.title}`}
      onClick={() => setOpen(true)}
      radius={3}
      className="flex flex-col"
      style={{ padding: px(6), gap: px(3) }}
    >
      <span aria-hidden="true" className="flex min-h-0 w-full flex-1 items-end justify-between" style={{ gap: px(1.6) }}>
        {BARS.map((h, i) => (
          <span
            key={i}
            className="flex-1 origin-bottom bg-type-dark"
            style={{
              height: `${h * 100}%`,
              borderRadius: px(0.8),
              animation: playing ? `eq ${0.7 + (i % 4) * 0.18}s ease-in-out ${i * 0.07}s infinite` : "none",
              transform: playing ? undefined : "scaleY(0.16)",
              transition: "transform 0.4s",
            }}
          />
        ))}
      </span>
      <span className="block w-full truncate text-left font-sans text-type-dark" style={{ fontSize: u(4.8) }}>
        {track.title}
      </span>
    </Hotspot>
  );
}

/* ───────────────────────── колокольчик «Success!» → ачивки ───────────────────────── */

export function AchievementsOverlay() {
  const { t } = useI18n();
  const { motion } = useMotion();
  const [index, setIndex] = useState(0);
  const [hold, setHold] = useState(false);
  const item = achievements[index];
  const result = t(item.result);

  useEffect(() => {
    if (hold || !motion) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % achievements.length), 4500);
    return () => window.clearInterval(id);
  }, [hold, motion]);

  return (
    <div onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
      <Hotspot
        box={[648, 26, 64, 64]}
        label={`${t(dict.achievements.next)}: ${t(achievements[(index + 1) % achievements.length].title)}`}
        onClick={() => setIndex((i) => (i + 1) % achievements.length)}
        radius="full"
      />
      <At box={[630, 106, 86, 26]} className="grid place-items-center" aria-live="polite">
        <p
          key={item.id}
          className="animate-[rise_0.45s_ease-out] text-center font-sans font-bold whitespace-nowrap text-type-light"
          style={{ fontSize: u(result.length > 10 ? 9.5 : 14), lineHeight: 1 }}
        >
          {result}!
        </p>
      </At>
      <At box={[632, 131, 82, 13]} className="flex items-center justify-center">
        <p className="max-w-full truncate font-sans text-type-muted" style={{ fontSize: u(5.4) }}>
          {t(item.title)} · {item.year}
        </p>
      </At>
    </div>
  );
}

/* ───────────────────────── «System Message» → лог обновлений ───────────────────────── */

export function SystemMessageOverlay() {
  const { locale, t } = useI18n();
  const ordered = [...updates].reverse();
  const [index, setIndex] = useState(0);
  const entry = ordered[index];
  const date = new Date(`${entry.date}T00:00:00`).toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" });
  const step = (delta: number) => setIndex((i) => (i + delta + ordered.length) % ordered.length);

  return (
    <section aria-labelledby="system-message-title">
      <At box={[582, 166, 126, 12]} className="flex items-center justify-between font-sans text-type-dark" style={{ fontSize: u(7.4) }}>
        <h2 id="system-message-title" className="truncate font-normal">
          {t(dict.system.title)}.
        </h2>
        <span className="tabular-nums opacity-70" style={{ fontSize: u(5) }}>
          {index + 1}/{ordered.length}
        </span>
      </At>

      <At box={[592, 184, 116, 36]} className="flex flex-col items-center justify-center text-center text-type-soft" aria-live="polite">
        <p key={entry.id} className="animate-[rise_0.4s_ease-out] font-sans italic" style={{ fontSize: u(5.6), lineHeight: 1.3 }}>
          {t(entry.body)}
        </p>
        <time dateTime={entry.date} className="font-mono opacity-55" style={{ fontSize: u(3.8), marginTop: u(1.5) }}>
          {date}
        </time>
      </At>

      <Hotspot box={[601, 224, 40, 20]} label={t(dict.system.ok)} onClick={() => step(1)} className="grid place-items-center">
        <span className="font-sans text-type-soft" style={{ fontSize: u(7) }}>
          {t(dict.system.ok)}
        </span>
      </Hotspot>
      <Hotspot box={[662, 224, 41, 20]} label={t(dict.system.cancel)} onClick={() => step(-1)} className="grid place-items-center">
        <span className="font-sans text-type-soft" style={{ fontSize: u(7) }}>
          {t(dict.system.cancel)}
        </span>
      </Hotspot>
    </section>
  );
}

/* ───────────────────────── «Heaven» → контакты ───────────────────────── */

export function ContactOverlay() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const email = profile.contacts.email;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email.label);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = email.href;
    }
  };

  return (
    <>
      <Hotspot
        box={[471, 198, 47, 13]}
        label={t(dict.contact.telegram)}
        href={profile.contacts.telegram.href}
        radius="full"
        className="grid place-items-center"
      >
        <span className="font-sans text-type-soft" style={{ fontSize: u(5.6) }}>
          {profile.contacts.telegram.label}
        </span>
      </Hotspot>

      <Hotspot
        box={[458, 218, 47, 15]}
        label={copied ? t(dict.contact.copied) : `${t(dict.contact.copyEmail)}: ${email.label}`}
        onClick={copy}
        radius="full"
        className="grid place-items-center"
      >
        {copied ? (
          <span className="grid place-items-center rounded-full bg-type-dark text-type-light" style={{ width: u(11), height: u(11), marginLeft: u(28) }}>
            <Check aria-hidden="true" style={{ width: u(7), height: u(7) }} strokeWidth={3} />
          </span>
        ) : null}
      </Hotspot>
      <span role="status" className="sr-only">
        {copied ? t(dict.contact.copied) : ""}
      </span>

      <Hotspot box={[521, 204, 16, 34]} label={t(dict.contact.github)} href={profile.contacts.github.href} radius={2} />
    </>
  );
}

/* ───────────────────────── «Document of …» → опыт ───────────────────────── */

const DOC_ROWS = [
  { box: [423, 248, 106, 11], text: [427, 249, 70, 9] },
  { box: [423, 268, 106, 13], text: [438, 270, 70, 10] },
] as const;

export function ExperienceOverlay() {
  const { t } = useI18n();
  const [open, setOpen] = useState<string | null>(null);
  // Двух строк на картинке хватает на два первых документа, третий — в окне.
  const current = experience.find((item) => item.id === open);

  return (
    <>
      {DOC_ROWS.map((row, i) => {
        const item = experience[i];
        return (
          <Hotspot key={item.id} box={row.box} label={t(item.title)} onClick={() => setOpen(item.id)} radius={2}>
            <span
              className="absolute truncate text-left font-sans text-type-soft"
              style={{
                left: px(row.text[0] - row.box[0]),
                top: px(row.text[1] - row.box[1]),
                width: px(row.text[2]),
                fontSize: u(5.6),
              }}
            >
              {t(dict.experience.prefix)} {t(item.title).toLowerCase()}
            </span>
          </Hotspot>
        );
      })}

      <Dialog open={open !== null} onOpenChange={(next) => !next && setOpen(null)}>
        <DialogContent className="w-[min(92vw,500px)] gap-4 p-5">
          <DialogTitle className="font-mono">{t(dict.experience.title)}</DialogTitle>
          <DialogDescription className="sr-only">{current ? t(current.title) : ""}</DialogDescription>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {experience.map((item) => (
              <li key={item.id} className={item.id === open ? "" : "opacity-60"}>
                <p className="font-sans text-sm font-bold">{t(item.title)}</p>
                <p className="font-mono text-sm leading-relaxed">{t(item.body)}</p>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ───────────────────────── «Virtual Picture.» → фанарты ───────────────────────── */

export function PictureOverlay() {
  const { t } = useI18n();
  const now = useNow(60_000);
  const [index, setIndex] = useState(art.length - 1);
  const [open, setOpen] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const item = art[index];
  const alt = `${t(dict.shrine.artAlt)} ${item.artist}`;
  const date = now ? `${String(now.getDate()).padStart(2, "0")}.${String(now.getMonth() + 1).padStart(2, "0")}` : "··.··";

  const step = (delta: number) => setIndex((i) => (i + delta + art.length) % art.length);
  const random = () =>
    setIndex((i) => {
      const next = Math.floor(Math.random() * (art.length - 1));
      return next >= i ? next + 1 : next;
    });

  return (
    <section aria-labelledby="virtual-picture-title">
      <At box={[561, 266, 72, 14]} className="flex items-center">
        <h2 id="virtual-picture-title" className="truncate font-sans font-normal text-type-dark" style={{ fontSize: u(9) }}>
          {t(dict.shrine.title)}
        </h2>
      </At>
      <At box={[664, 266, 28, 14]} className="flex items-center font-sans text-type-dark tabular-nums" style={{ fontSize: u(9) }}>
        <span suppressHydrationWarning>{date}</span>
      </At>

      <At box={[550, 289, 110, 11]} className="flex items-center justify-between font-sans text-type-soft" style={{ fontSize: u(5.6), paddingInline: u(3) }}>
        <span aria-hidden="true" className="flex" style={{ gap: u(6) }}>
          <span>{t(dict.shrine.menu.file)}</span>
          <span>{t(dict.shrine.menu.action)}</span>
          <span>{t(dict.shrine.menu.help)}</span>
        </span>
        <span className="truncate opacity-70" style={{ fontSize: u(3.8) }}>
          {t(dict.shrine.credit)} {item.artist}
        </span>
      </At>

      <Hotspot box={[550, 302, 110, 92]} label={`${t(dict.shrine.open)}: ${alt}`} onClick={() => setOpen(true)} radius={0} className="overflow-hidden bg-snow">
        {/* eslint-disable-next-line @next/next/no-img-element -- статический экспорт */}
        <img key={item.src} src={item.src} alt={alt} width={item.width} height={item.height} className="size-full animate-[rise_0.4s_ease-out] object-cover" />
      </Hotspot>

      <Hotspot box={[666, 307, 47, 13]} label={t(dict.shrine.next)} onClick={() => step(1)} className="grid place-items-center">
        <span className="font-sans text-type-dark" style={{ fontSize: u(8) }}>
          {t(dict.shrine.next)}
        </span>
      </Hotspot>
      <Hotspot box={[666, 324, 47, 13]} label={t(dict.shrine.prev)} onClick={() => step(-1)} className="grid place-items-center">
        <span className="font-sans text-type-dark" style={{ fontSize: u(8) }}>
          {t(dict.shrine.prev)}
        </span>
      </Hotspot>

      {/* Плитки с иконками нарисованы на картинке, сверху — только кнопки. */}
      <Hotspot
        box={[667, 344, 22, 22]}
        label={t(dict.player.like)}
        pressed={Boolean(liked[item.src])}
        onClick={() => setLiked((prev) => ({ ...prev, [item.src]: !prev[item.src] }))}
        className={liked[item.src] ? "!bg-snow/35" : undefined}
      />
      <Hotspot box={[691, 344, 22, 22]} label={t(dict.shrine.random)} onClick={random} />
      <Hotspot box={[667, 368, 22, 22]} label={t(dict.shrine.open)} onClick={() => setOpen(true)} />
      <Hotspot box={[691, 368, 22, 22]} label={t(dict.shrine.prev)} onClick={() => step(-1)} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-auto max-w-[94vw] gap-2 p-2">
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.src} alt={alt} width={item.width} height={item.height} className="max-h-[82dvh] w-auto object-contain" />
          <DialogDescription className="px-1 font-mono text-xs text-ink">
            {t(dict.shrine.credit)} {item.artist}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </section>
  );
}
