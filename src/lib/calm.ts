import { useReducedMotion } from 'motion/react'
import { useMotion } from './motion'

/** True when motion should be skipped: OS setting or the on-board Motion toggle. */
export function useCalm(): boolean {
  const reduce = useReducedMotion()
  const { motion } = useMotion()
  return Boolean(reduce) || !motion
}
