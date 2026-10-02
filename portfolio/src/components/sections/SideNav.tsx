"use client";

import { Win98Window } from "@/components/chrome/Win98Window";
import { dict } from "@/content/dict";
import { useI18n } from "@/lib/i18n";

/**
 * Вертикальное меню-якоря. Стиль красного меню из референса: список без
 * отступов, на hover фон инвертируется в blood.
 *
 * Кегль крупный намеренно: bone на blood в покое и void-deep на blood при
 * инверсии читаются уверенно только на больших размерах.
 */

const items = [
  { id: "about", label: dict.nav.about },
  { id: "stack", label: dict.nav.stack },
  { id: "achievements", label: dict.nav.achievements },
  { id: "experience", label: dict.nav.experience },
  { id: "contact", label: dict.nav.contact },
] as const;

export function SideNav() {
  const { t } = useI18n();

  return (
    <Win98Window title={dict.sections.nav}>
      <nav aria-label={t(dict.sections.nav)}>
        <ul className="m-0 flex list-none flex-col gap-px p-0">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="block border border-blood-dim bg-void-deep px-2 py-1 font-pixel text-xl leading-tight text-bone no-underline uppercase transition-colors hover:bg-blood hover:text-void-deep focus-visible:bg-blood focus-visible:text-void-deep"
              >
                {t(item.label)}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </Win98Window>
  );
}
