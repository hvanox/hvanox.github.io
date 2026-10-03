import { StarFour } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import { useCalm } from '../../lib/calm'
import { u } from '../../lib/u'

/** Tactile button shell used by every control on the page. */
export function Press({
  label,
  children,
  className = '',
  style,
  onClick,
  pressed,
}: {
  label: string
  children?: ReactNode
  className?: string
  style?: CSSProperties
  onClick?: () => void
  pressed?: boolean
}) {
  const reduce = useCalm()
  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      whileHover={reduce ? undefined : { y: -1.5 }}
      whileTap={reduce ? undefined : { scale: 0.94, y: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      className={`grid cursor-pointer place-items-center border-0 p-0 ${className}`}
      style={style}
    >
      {children}
    </motion.button>
  )
}

/** Small sparkle used as print decoration. */
export function Sparkle({ size = 6, style }: { size?: number; style?: CSSProperties }) {
  return (
    <StarFour
      aria-hidden
      weight="fill"
      size={u(size)}
      color="var(--color-cream-hi)"
      className="pointer-events-none absolute"
      style={style}
    />
  )
}
