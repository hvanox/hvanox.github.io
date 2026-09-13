/**
 * Красные зигзаг-полосы по краям viewport — мотив багета с официального
 * сайта Тето. Чистый inline SVG с повторяющимся path, без картинок.
 * Декорация: aria-hidden и pointer-events-none.
 */

function Rail({ id, mirrored }: { id: string; mirrored?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-full w-[18px] text-blood"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id={id} width="18" height="28" patternUnits="userSpaceOnUse">
          {/* Пила: вниз-вправо, вниз-влево. Заливки нет, только штрих. */}
          <path
            d="M2 -2 L16 12 L2 26 L16 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="miter"
          />
        </pattern>
      </defs>
      <rect
        width="18"
        height="100%"
        fill={`url(#${id})`}
        transform={mirrored ? "scale(-1,1) translate(-18,0)" : undefined}
      />
    </svg>
  );
}

export function ZigzagRail() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-y-0 left-0 z-0 w-full">
      <div className="absolute inset-y-0 left-0 opacity-70">
        <Rail id="zigzag-left" />
      </div>
      <div className="absolute inset-y-0 right-0 opacity-70">
        <Rail id="zigzag-right" mirrored />
      </div>
    </div>
  );
}
