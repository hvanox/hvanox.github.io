import { Win98Window } from "@/components/chrome/Win98Window";
import { dict } from "@/content/dict";
import { experience } from "@/content/profile";
import { T } from "@/lib/t";

/** Три блока опыта из profile.ts. */

export function Experience() {
  return (
    <Win98Window id="experience" title={dict.sections.experience}>
      <div className="flex flex-col gap-3">
        {experience.map((item) => (
          <article key={item.id} className="border-l-2 border-blood pl-2">
            <h3 className="font-display text-lg tracking-[0.04em] text-bone uppercase">
              <T value={item.title} />
            </h3>
            <p className="mt-1 font-mono text-xs leading-relaxed text-bone">
              <T value={item.body} />
            </p>
          </article>
        ))}
      </div>
    </Win98Window>
  );
}
