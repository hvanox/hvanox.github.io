import { Badge8831 } from "@/components/chrome/Badge8831";
import { Win98Window } from "@/components/chrome/Win98Window";
import { dict } from "@/content/dict";
import { stack } from "@/content/profile";
import { T } from "@/lib/t";

/**
 * Стек группами. Каждый пункт — баннер 88×31, сетка плотная:
 * плотность здесь часть смысла (DESIGN.md).
 */

/** Акцент по группе — чтобы ряды баннеров различались на глаз. */
const accentByGroup = {
  lang: "blood",
  data: "cyan",
  infra: "blood",
  auth: "acid",
  tools: "cyan",
} as const;

export function Stack() {
  return (
    <Win98Window id="stack" title={dict.sections.stack}>
      <div className="flex flex-col gap-3">
        {stack.map((group) => (
          <div key={group.group} className="flex flex-col gap-1.5">
            <h3 className="font-pixel text-[10px] tracking-[0.1em] text-bone-dim uppercase">
              <T value={dict.stackGroups[group.group]} />
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <Badge8831 key={item} label={item} accent={accentByGroup[group.group]} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Win98Window>
  );
}
