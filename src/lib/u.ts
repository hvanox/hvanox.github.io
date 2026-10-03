import type { CSSProperties } from 'react'

/** Reference-pixel unit: `u(12)` is 12px of the 736x414 reference at the current scale. */
export const u = (n: number) => `calc(var(--u) * ${n})`

/** Box in reference pixels. */
export const box = (w: number, h: number, extra: CSSProperties = {}): CSSProperties => ({
  width: u(w),
  height: u(h),
  ...extra,
})

/** Absolute placement on the desktop canvas, as a percentage of the reference frame. */
export const place = (x: number, y: number): CSSProperties => ({
  left: `${(x / 736) * 100}%`,
  top: `${(y / 414) * 100}%`,
})

export const EASE = [0.16, 1, 0.3, 1] as const

/* ---- box-shadow builders (all in reference px) ---- */

/** Outer outline ring, like a sticker edge. */
export const ring = (w: number, c = 'var(--color-cream-hi)') => `0 0 0 ${u(w)} ${c}`

/** Raised bevel: highlight top-left, shade bottom-right. */
export const bevel = (w = 1, hi = 'var(--color-paper)', lo = 'var(--color-shade)') =>
  `inset ${u(w)} ${u(w)} 0 ${hi}, inset ${u(-w)} ${u(-w)} 0 ${lo}`

export const sh = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(', ')
