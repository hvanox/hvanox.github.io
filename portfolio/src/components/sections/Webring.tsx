import { Badge8831 } from "@/components/chrome/Badge8831";
import { Win98Window } from "@/components/chrome/Win98Window";
import { dict } from "@/content/dict";
import { stack } from "@/content/profile";

/**
 * Вебринг, но без чужих сайтов: на кнопках 88×31 — технологии стека.
 * Ссылаться на посторонние страницы нечем и незачем.
 */

const technologies = stack.flatMap((group) => group.items);

export function Webring() {
  return (
    <Win98Window title={dict.sections.webring}>
      <div className="flex flex-wrap gap-1.5">
        {technologies.map((tech, i) => (
          <Badge8831
            key={tech}
            label={tech}
            accent={i % 3 === 0 ? "blood" : i % 3 === 1 ? "cyan" : "acid"}
          />
        ))}
      </div>
    </Win98Window>
  );
}
