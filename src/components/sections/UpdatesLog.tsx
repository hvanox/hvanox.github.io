import { Win98Window } from "@/components/chrome/Win98Window";
import { dict } from "@/content/dict";
import type { UpdateEntry } from "@/content/updates";
import { T } from "@/lib/t";

/**
 * Лог обновлений. Записи приходят пропсом из src/content/updates.ts —
 * даты настоящие, декоративных не придумываем (DESIGN.md).
 */

export function UpdatesLog({ entries }: { entries: UpdateEntry[] }) {
  return (
    <Win98Window title={dict.sections.updates}>
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {entries.map((entry) => (
          <li key={entry.id} className="flex flex-col gap-0.5 border-l-2 border-blood-dim pl-2">
            <time
              dateTime={entry.date}
              className="font-pixel text-[9px] tracking-[0.06em] text-cyan"
            >
              {entry.date}
            </time>
            <p className="font-mono text-xs leading-snug text-bone">
              <T value={entry.body} />
            </p>
          </li>
        ))}
      </ol>
    </Win98Window>
  );
}
