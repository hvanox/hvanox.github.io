"use client";

import { useI18n, type Localized } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Клиентский лист для <img>: `alt` — обычный атрибут, JSX внутрь не положить,
 * а локаль живёт в контексте. Поэтому пара переводов разворачивается здесь.
 */

type ArtImageProps = {
  src: string;
  width: number;
  height: number;
  alt: string | Localized;
  className?: string;
};

export function ArtImage({ src, width, height, alt, className }: ArtImageProps) {
  const { t } = useI18n();

  return (
    // eslint-disable-next-line @next/next/no-img-element -- статический экспорт: оптимизации нет, next/image здесь только вес
    <img
      src={src}
      alt={typeof alt === "string" ? alt : t(alt)}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={cn("block h-auto w-full border border-blood-dim bg-void-deep", className)}
    />
  );
}
