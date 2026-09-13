"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { dict } from "@/content/dict";

/**
 * Счётчик визитов в духе 2000-х. Сервера нет, поэтому счётчик локальный:
 * основание фиксируется случайным числом при первом визите, дальше растёт
 * монотонно. Мы не притворяемся, что это глобальные визиты — так и подписано
 * в title/aria-label.
 */

const BASE_KEY = "hvano.visits.base";
const COUNT_KEY = "hvano.visits.count";

export function VisitCounter() {
  const { t } = useI18n();
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    let base = Number(window.localStorage.getItem(BASE_KEY));
    if (!Number.isFinite(base) || base <= 0) {
      // Основание один раз и навсегда: иначе счётчик прыгал бы вниз.
      base = 13_400 + Math.floor(Math.random() * 8_600);
      window.localStorage.setItem(BASE_KEY, String(base));
    }

    const seen = Number(window.localStorage.getItem(COUNT_KEY));
    const next = (Number.isFinite(seen) && seen > 0 ? seen : 0) + 1;
    window.localStorage.setItem(COUNT_KEY, String(next));

    // Намеренно после гидрации: основание обязано читаться из localStorage,
    // иначе серверная и клиентская разметка разъедутся.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisits(base + next);
  }, []);

  const label = t(dict.header.visitsLocal);
  // До гидрации числа нет — держим место нулями, чтобы не дёргать раскладку.
  const digits = (visits ?? 0).toString().padStart(6, "0");

  return (
    <div className="flex flex-col items-start gap-0.5" title={label}>
      <span
        role="img"
        aria-label={`${label} ${visits ?? 0} ${t(dict.header.visits)}`}
        className="flex gap-px border border-chrome bg-void-deep px-1 py-0.5 font-pixel text-sm leading-none tracking-[0.14em] text-acid"
      >
        {digits.split("").map((digit, i) => (
          <span key={i} aria-hidden="true">
            {digit}
          </span>
        ))}
      </span>
      <span aria-hidden="true" className="font-pixel text-[9px] tracking-[0.06em] text-bone-dim uppercase">
        {t(dict.header.visits)}
      </span>
    </div>
  );
}
