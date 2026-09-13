import { ArtImage } from "@/components/chrome/ArtImage";
import { dict } from "@/content/dict";
import type { Localized } from "@/lib/i18n";
import { T } from "@/lib/t";
import { cn } from "@/lib/utils";

/**
 * Арт Тето. Обычный <img> (внутри ArtImage): экспорт статический, оптимизатор
 * next/image на Pages не работает. Подпись автора под картинкой обязательна —
 * это фанарт, автор указывается всегда (DESIGN.md).
 */

type TetoArtProps = {
  src: string;
  artist: string;
  width: number;
  height: number;
  /** Пара переводов допустима: alt должен быть осмысленным на обоих языках. */
  alt: string | Localized;
  className?: string;
  /** Класс для самой картинки, когда нужно ограничить высоту. */
  imgClassName?: string;
};

export function TetoArt({
  src,
  artist,
  width,
  height,
  alt,
  className,
  imgClassName,
}: TetoArtProps) {
  return (
    <figure className={cn("m-0 flex flex-col gap-1", className)}>
      <ArtImage src={src} alt={alt} width={width} height={height} className={imgClassName} />
      <figcaption className="font-mono text-[10px] leading-tight text-bone-dim">
        <T value={dict.shrine.credit} /> {artist}
      </figcaption>
    </figure>
  );
}
