"use client";

import { useEffect, useRef, useState } from "react";
import { Win98Window } from "@/components/chrome/Win98Window";
import { dict } from "@/content/dict";
import { profile } from "@/content/profile";
import { useI18n } from "@/lib/i18n";

/**
 * Контакты терминальным видом. Адреса берутся из profile.contacts,
 * подсказка — из dict.contact.hint. Кнопка копирует значение через
 * navigator.clipboard и показывает состояние copied.
 */

const entries = [
  { id: "telegram", ...profile.contacts.telegram },
  { id: "email", ...profile.contacts.email },
  { id: "github", ...profile.contacts.github },
] as const;

export function Contact() {
  const { t } = useI18n();
  const [copied, setCopied] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const copy = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setCopied(id);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(null), 1500);
  };

  return (
    <Win98Window id="contact" title={dict.sections.contact}>
      <div className="border border-blood-dim bg-void-deep p-2">
        <ul className="m-0 flex list-none flex-col gap-2 p-0" aria-live="polite">
          {entries.map((entry) => {
            const isCopied = copied === entry.id;
            return (
              <li
                key={entry.id}
                className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs leading-snug text-bone"
              >
                <span aria-hidden="true" className="text-blood">
                  &gt;
                </span>
                {/* Технический лейбл протокола — исключение из правила словаря. */}
                <span className="font-pixel text-[10px] tracking-[0.08em] text-bone-dim uppercase">
                  {entry.id}
                </span>
                <a
                  href={entry.href}
                  target={entry.id === "email" ? undefined : "_blank"}
                  rel={entry.id === "email" ? undefined : "noopener noreferrer"}
                  className="min-w-0 flex-1 truncate"
                >
                  {entry.label}
                </a>
                <button
                  type="button"
                  onClick={() => copy(entry.id, entry.label)}
                  aria-label={`${t(isCopied ? dict.contact.copied : dict.contact.copy)}: ${entry.label}`}
                  className="shrink-0 cursor-pointer border border-chrome bg-void px-1.5 py-0.5 font-pixel text-[10px] leading-none tracking-[0.06em] text-bone uppercase transition-colors hover:border-blood hover:text-blood active:translate-y-px"
                >
                  {t(isCopied ? dict.contact.copied : dict.contact.copy)}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-2 font-mono text-[11px] leading-snug text-bone-dim">
        {t(dict.contact.hint)}
      </p>
    </Win98Window>
  );
}
