/**
 * Скан-линии поверх всей страницы. Слой фиксированный и не ловит курсор,
 * иначе он съедал бы клики. При reduced-motion `scanlines-layer` скрывается
 * правилом из globals.css.
 */

export function ScanlineOverlay() {
  return (
    <div
      aria-hidden="true"
      className="scanlines-layer pointer-events-none fixed inset-0 z-50 opacity-40 [mix-blend-mode:overlay]"
    />
  );
}
