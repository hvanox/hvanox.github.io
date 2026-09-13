import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { T } from "@/lib/t";
import type { Localized } from "@/lib/i18n";

/**
 * Основной контейнер секций: полоса заголовка в стиле win98, жёсткая тень,
 * рамка 1px. Server Component — состояния здесь нет.
 *
 * `title` принимает и готовую строку, и пару переводов: заголовки берутся из
 * `dict.sections`, а язык переключается в рантайме, поэтому пару рендерим через
 * клиентский лист <T/>. Это позволяет секциям остаться серверными.
 */

type Win98WindowProps = {
  title: string | Localized;
  titleJp?: string;
  children: ReactNode;
  className?: string;
  tone?: "chrome" | "blood";
  /** Якорь для SideNav. */
  id?: string;
  /** Уровень заголовка: вложенные окна (ачивки) не должны ломать порядок. */
  titleAs?: "h2" | "h3";
};

export function Win98Window({
  title,
  titleJp,
  children,
  className,
  tone = "chrome",
  id,
  titleAs: TitleTag = "h2",
}: Win98WindowProps) {
  const isBlood = tone === "blood";

  return (
    <section
      id={id}
      className={cn(
        "border shadow-hard",
        isBlood ? "border-blood bg-void-deep" : "border-chrome bg-void",
        className,
      )}
    >
      {/* Полоса заголовка. Текст void-deep по светлой полосе: контраст ~8:1. */}
      <div
        className={cn(
          "flex items-center gap-2 border-b px-2 py-1",
          isBlood ? "border-blood bg-blood" : "border-chrome bg-chrome",
        )}
      >
        <TitleTag className="min-w-0 flex-1 truncate font-pixel text-[11px] leading-none tracking-[0.08em] text-void-deep uppercase">
          {typeof title === "string" ? title : <T value={title} />}
          {titleJp ? (
            <span className="ml-2 font-jp text-[11px] normal-case">{titleJp}</span>
          ) : null}
        </TitleTag>

        {/* Декорация: настоящих окон здесь нет, кнопки не интерактивны. */}
        <span
          aria-hidden="true"
          className="flex shrink-0 items-center gap-1 font-pixel text-[10px] leading-none text-void-deep"
        >
          <span className="border border-void-deep/60 px-1">_</span>
          <span className="border border-void-deep/60 px-1">□</span>
          <span className="border border-void-deep/60 px-1">×</span>
        </span>
      </div>

      <div className="p-3">{children}</div>
    </section>
  );
}
