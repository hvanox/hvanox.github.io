import { cn } from "@/lib/utils";

/**
 * Пиксельный баннер 88×31 — формат кнопок вебринга из 90-х.
 * Акцент уходит в рамку и полоску сверху, текст остаётся bone:
 * blood/cyan/acid как мелкий текст не проходят 4.5:1.
 */

type Badge8831Props = {
  label: string;
  accent?: "blood" | "cyan" | "acid";
  className?: string;
};

const accents: Record<NonNullable<Badge8831Props["accent"]>, { border: string; stripe: string }> = {
  blood: { border: "border-blood", stripe: "bg-blood" },
  cyan: { border: "border-cyan", stripe: "bg-cyan" },
  acid: { border: "border-acid", stripe: "bg-acid" },
};

/** Текст ужимается под 88px: чем длиннее подпись, тем мельче кегль. */
function fontSize(label: string): string {
  if (label.length <= 6) return "9px";
  if (label.length <= 9) return "8px";
  if (label.length <= 12) return "7px";
  return "6px";
}

export function Badge8831({ label, accent = "blood", className }: Badge8831Props) {
  const tone = accents[accent];

  return (
    <span
      className={cn(
        "inline-flex h-[31px] w-[88px] shrink-0 flex-col overflow-hidden border bg-void-deep shadow-hard",
        tone.border,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("block h-[3px] w-full shrink-0", tone.stripe)} />
      <span
        className="grid flex-1 place-items-center px-1 text-center font-pixel leading-none tracking-[0.04em] text-bone uppercase"
        style={{ fontSize: fontSize(label) }}
      >
        <span className="block w-full truncate">{label}</span>
      </span>
    </span>
  );
}
