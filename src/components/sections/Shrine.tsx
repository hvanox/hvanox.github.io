"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { TetoArt } from "@/components/chrome/TetoArt";
import { Win98Window } from "@/components/chrome/Win98Window";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import artCatalog from "@/content/art.json";
import { dict } from "@/content/dict";
import { useI18n } from "@/lib/i18n";

/**
 * Галерея фанартов: masonry через CSS columns, все 26 артов из art.json.
 * Клик по арту раскрывает его в модалке (Radix Dialog) — там подпись автора
 * тоже обязательна.
 */

type ArtItem = (typeof artCatalog)[number];

export function Shrine() {
  const { t } = useI18n();
  const [open, setOpen] = useState<ArtItem | null>(null);

  const altFor = (artist: string) => ({
    ru: `${dict.shrine.artAlt.ru} ${artist}`,
    en: `${dict.shrine.artAlt.en} ${artist}`,
  });

  return (
    <Win98Window id="shrine" title={dict.sections.shrine} titleJp="重音テト">
      <p className="mb-2 font-mono text-[11px] leading-snug text-bone-dim">
        {t(dict.shrine.intro)}
      </p>

      {/* columns вместо grid: настоящая кладка без дырок под разные пропорции. */}
      <div className="columns-2 gap-1.5 [column-fill:balance] lg:columns-2">
        {artCatalog.map((item) => (
          <button
            key={item.src}
            type="button"
            onClick={() => setOpen(item)}
            aria-label={`${t(dict.shrine.open)} ${item.artist}`}
            className="mb-1.5 block w-full cursor-pointer border-0 bg-transparent p-0 text-left transition-transform hover:scale-[1.02] active:scale-[0.99]"
          >
            <TetoArt
              src={item.src}
              artist={item.artist}
              width={item.width}
              height={item.height}
              alt={altFor(item.artist)}
            />
          </button>
        ))}
      </div>

      <Dialog open={open !== null} onOpenChange={(next) => !next && setOpen(null)}>
        <DialogContent aria-describedby={undefined}>
          {open ? (
            <>
              <div className="flex items-center gap-2 border-b border-chrome bg-chrome px-2 py-1">
                <DialogTitle className="min-w-0 flex-1 truncate uppercase">
                  {t(dict.sections.shrine)}
                </DialogTitle>
                <DialogClose
                  aria-label={t(dict.a11y.close)}
                  className="grid size-5 shrink-0 cursor-pointer place-items-center border border-void-deep/60 text-void-deep transition-colors hover:bg-void-deep hover:text-bone"
                >
                  <X aria-hidden="true" className="size-3" strokeWidth={2.5} />
                </DialogClose>
              </div>

              <div className="p-3">
                <TetoArt
                  src={open.src}
                  artist={open.artist}
                  width={open.width}
                  height={open.height}
                  alt={altFor(open.artist)}
                  imgClassName="max-h-[70dvh] w-auto mx-auto"
                />
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </Win98Window>
  );
}
