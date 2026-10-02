import { Win98Window } from "@/components/chrome/Win98Window";
import { achievements } from "@/content/profile";
import { dict } from "@/content/dict";
import { T } from "@/lib/t";

/**
 * По одному окну на ачивку, тон blood. Ссылок нет намеренно —
 * так просил Хвано (BRIEF, profile.ts).
 */

export function Achievements() {
  return (
    <Win98Window id="achievements" title={dict.sections.achievements}>
      <div className="flex flex-col gap-3">
        {achievements.map((item, i) => (
          <Win98Window
            key={item.id}
            title={item.title}
            titleAs="h3"
            tone="blood"
            // Рубленая сетка: блоки чуть повёрнуты, не выровнены пиксельно.
            className={i % 2 === 0 ? "skew-card" : undefined}
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-pixel text-[10px] tracking-[0.1em] text-cyan">{item.year}</span>
              <span className="font-display text-xl tracking-[0.04em] text-acid uppercase">
                <T value={item.result} />
              </span>
            </div>
            <p className="mt-1 font-mono text-xs leading-snug text-bone">
              <T value={item.note} />
            </p>
          </Win98Window>
        ))}
      </div>
    </Win98Window>
  );
}
