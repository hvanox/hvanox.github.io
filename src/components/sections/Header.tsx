"use client";

import { GlitchText } from "@/components/chrome/GlitchText";
import { VisitCounter } from "@/components/chrome/VisitCounter";
import { Win98Window } from "@/components/chrome/Win98Window";
import { dict, locales } from "@/content/dict";
import { profile } from "@/content/profile";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Шапка: логотип глитчем, японское имя Тето, слоган, локальный счётчик
 * и переключатель языка. Skip-link стоит первым в порядке табуляции.
 */

export function Header() {
  const { locale, setLocale, t } = useI18n();

  return (
    <header className="flex flex-col gap-2">
      {/* Виден только при фокусе с клавиатуры. */}
      <a
        href="#main"
        className="sr-only font-pixel text-[11px] uppercase focus:not-sr-only focus:inline-block focus:border focus:border-cyan focus:bg-void-deep focus:px-2 focus:py-1 focus:text-cyan"
      >
        {t(dict.a11y.skipToContent)}
      </a>

      <Win98Window title={dict.sections.welcome} titleJp={profile.tetoName}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <GlitchText
              as="h1"
              text={profile.handle.toUpperCase()}
              className="text-4xl leading-none tracking-[0.06em] sm:text-6xl"
            />
            <p className="mt-1 font-jp text-lg text-blood-dim">{profile.tetoName}</p>
            <p className="mt-2 font-mono text-sm text-bone">{t(dict.header.slogan)}</p>
            <p className="font-mono text-xs text-bone-dim">
              {t(profile.role)} · {t(profile.location)}
            </p>
          </div>

          <div className="flex items-end gap-4">
            <VisitCounter />

            {/* Технические лейблы ru/en — исключение из правила про словарь. */}
            <div className="flex flex-col gap-0.5">
              <span
                aria-hidden="true"
                className="font-pixel text-[9px] tracking-[0.06em] text-bone-dim uppercase"
              >
                {t(dict.header.lang)}
              </span>
              <div
                role="group"
                aria-label={t(dict.header.lang)}
                className="flex border border-chrome"
              >
                {locales.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLocale(code)}
                    aria-pressed={locale === code}
                    className={cn(
                      "px-2 py-1 font-pixel text-xl leading-none uppercase transition-colors",
                      // blood как текст — только крупным кеглем на void-deep.
                      locale === code
                        ? "bg-void-deep text-blood"
                        : "bg-void text-bone-dim hover:text-bone",
                    )}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Win98Window>
    </header>
  );
}
