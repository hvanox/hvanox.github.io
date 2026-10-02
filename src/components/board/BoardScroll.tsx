"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Обёртка с горизонтальной прокруткой. На портретном экране борд шире
 * вьюпорта — стартуем с центра, где Тето, а не с левого края.
 */
export function BoardScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && el.scrollWidth > el.clientWidth) {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    }
  }, []);

  return (
    <div ref={ref} className="board-scroll">
      {children}
    </div>
  );
}
