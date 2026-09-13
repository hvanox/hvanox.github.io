"use client";

import { Win98Window } from "@/components/chrome/Win98Window";
import { dict } from "@/content/dict";
import { useI18n } from "@/lib/i18n";

/**
 * Статус: online / настроение / что слушает. Строки из dict.status,
 * точка — acid с animate-blink (токены из @theme, без хардкода).
 */

export function Status() {
  const { t } = useI18n();

  return (
    <Win98Window title={dict.sections.status}>
      <div className="flex flex-col gap-2 font-mono text-xs leading-snug text-bone">
        <p className="m-0 flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block size-2 shrink-0 rounded-full bg-acid animate-blink"
          />
          <span className="font-pixel text-[11px] tracking-[0.08em] uppercase">
            {t(dict.status.online)}
          </span>
        </p>
        <p className="m-0">
          <span className="text-bone-dim">{t(dict.status.mood)}: </span>
          {t(dict.status.moodValue)}
        </p>
        <p className="m-0">
          <span className="text-bone-dim">{t(dict.status.listening)}: </span>
          {t(dict.status.listeningValue)}
        </p>
      </div>
    </Win98Window>
  );
}
