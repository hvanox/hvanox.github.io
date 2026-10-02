import { TetoArt } from "@/components/chrome/TetoArt";
import { Win98Window } from "@/components/chrome/Win98Window";
import art from "@/content/art.json";
import { dict } from "@/content/dict";
import { T } from "@/lib/t";

/**
 * О себе плюс один портретный арт рядом. Портрет выбирается детерминированно
 * (первый portrait в каталоге), чтобы сборка была воспроизводимой.
 */

const portrait = art.find((item) => item.ratio === "portrait") ?? art[0];

export function About() {
  return (
    <Win98Window id="about" title={dict.sections.about} titleJp="重音テト">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm leading-relaxed text-bone">
            <T value={dict.about.body} />
          </p>
          <p className="mt-2 font-mono text-[11px] leading-snug text-bone-dim">
            <T value={dict.about.note} />
          </p>
        </div>

        <TetoArt
          src={portrait.src}
          artist={portrait.artist}
          width={portrait.width}
          height={portrait.height}
          alt={{
            ru: `${dict.shrine.artAlt.ru} ${portrait.artist}`,
            en: `${dict.shrine.artAlt.en} ${portrait.artist}`,
          }}
          className="w-full shrink-0 sm:w-40"
        />
      </div>
    </Win98Window>
  );
}
