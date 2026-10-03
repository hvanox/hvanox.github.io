import { animate, motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react'
import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import { useCalm } from './lib/calm'
import { useI18n } from './lib/i18n'
import { EASE, place, u } from './lib/u'
import { dict } from './content/dict'
import { DeviceRotate } from '@phosphor-icons/react'
import { Sparkle } from './components/ui/primitives'
import { ChartTile, ProfileCard, SongsCard, SpecStrip } from './components/blocks/LeftColumn'
import { ClockBar, GameStrip, LoadingWindow, TwinSliders } from './components/blocks/MidColumn'
import { CableLoop, CameraToggles, DocumentRows, GfxCard, MessagePanel, MonogramPlate, SquareTile } from './components/blocks/CenterColumn'
import { BellCard, NameRail, PictureWindow, SystemDialog } from './components/blocks/RightColumn'

/** Centre of Teto's area: panels boot outward from here. */
const ORIGIN = { x: 400, y: 207 }
/** The screen powers on first; everything else starts after it. */
const BOOT = 0.55

/** Pointer position over the board, -1..1 on each axis, spring-smoothed. */
type Pointer = { x: MotionValue<number>; y: MotionValue<number> }
const PointerContext = createContext<Pointer | null>(null)

/** Shift for a layer at `depth`: positive follows the cursor, negative goes against it. */
function useDepth(depth: number) {
  const p = useContext(PointerContext)!
  const x = useTransform(p.x, (v) => v * depth * 7)
  const y = useTransform(p.y, (v) => v * depth * 5)
  return { x, y }
}

function Slot({
  x,
  y,
  children,
  z,
  className = '',
  style,
  depth = 1,
}: {
  x: number
  y: number
  children: ReactNode
  z?: number
  className?: string
  style?: CSSProperties
  depth?: number
}) {
  const calm = useCalm()
  const shift = useDepth(depth)
  const delay = BOOT + Math.hypot(x - ORIGIN.x, y - ORIGIN.y) * 0.0016
  return (
    <motion.div
      className={`slot ${className}`}
      style={{ ...place(x, y), zIndex: z, x: shift.x, y: shift.y, ...style }}
      initial={calm ? false : { opacity: 0, scale: 0.96, filter: 'blur(6px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

const sparkles = [
  { x: 101, y: 181, s: 5 },
  { x: 334, y: 190, s: 4 },
  { x: 236, y: 64, s: 4 },
  { x: 712, y: 258, s: 5 },
  { x: 548, y: 170, s: 3.5 },
  { x: 8, y: 300, s: 4 },
  { x: 728, y: 160, s: 3.5 },
]

/**
 * Teto (official Synthesizer V 2 art). She prints in top to bottom under a
 * scanner bar while the pink misregistered copy slides into register.
 */
function Teto() {
  const calm = useCalm()
  const shadowX = useMotionValue(calm ? -9 : -46)
  const shadowY = useMotionValue(calm ? 5 : 30)
  const filter = useTransform(
    [shadowX, shadowY],
    ([sx, sy]) => `drop-shadow(calc(var(--u) * ${sx}) calc(var(--u) * ${sy}) 0 rgb(185 84 94 / 0.95))`,
  )

  useEffect(() => {
    if (calm) return
    const spring = { type: 'spring', stiffness: 60, damping: 11, delay: BOOT + 0.9 } as const
    const a = animate(shadowX, -9, spring)
    const b = animate(shadowY, 5, spring)
    return () => {
      a.stop()
      b.stop()
    }
  }, [calm, shadowX, shadowY])

  return (
    <div className="teto-float relative">
      <motion.img
        src="/teto/teto-full.png"
        alt="Kasane Teto"
        width={1200}
        height={1800}
        draggable={false}
        fetchPriority="high"
        className="pointer-events-none block h-auto w-full select-none"
        style={{ filter }}
        initial={calm ? false : { clipPath: 'inset(0% 0% 100% 0%)' }}
        animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        transition={{ duration: 1.5, delay: BOOT + 0.2, ease: [0.45, 0, 0.2, 1] }}
      />
      {!calm && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 block"
          style={{
            height: u(2.5),
            background: 'linear-gradient(90deg, transparent, var(--color-paper) 20%, var(--color-paper) 80%, transparent)',
            boxShadow: `0 0 ${u(8)} ${u(2)} rgb(244 240 241 / 0.6)`,
          }}
          initial={{ top: '0%', opacity: 1 }}
          animate={{ top: '100%', opacity: [1, 1, 0] }}
          transition={{ duration: 1.5, delay: BOOT + 0.2, ease: [0.45, 0, 0.2, 1], opacity: { duration: 1.5, delay: BOOT + 0.2, times: [0, 0.85, 1] } }}
        />
      )}
    </div>
  )
}

/** A scanner bar sweeps the board when the language changes. */
function LocaleSweep() {
  const { locale } = useI18n()
  const calm = useCalm()
  const first = useRef(true)
  const [run, setRun] = useState(0)
  // The bar unmounts after its pass, so it never hangs below the board.
  const [finished, setFinished] = useState(0)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRun((n) => n + 1)
  }, [locale])
  if (calm || run === 0 || run === finished) return null
  return (
    <motion.div
      key={run}
      onAnimationComplete={() => setFinished(run)}
      aria-hidden
      className="pointer-events-none absolute inset-x-0"
      style={{
        zIndex: 30,
        height: '9%',
        background: 'linear-gradient(180deg, transparent, rgb(244 240 241 / 0.16) 70%, rgb(244 240 241 / 0.75) 96%, transparent)',
        mixBlendMode: 'screen',
      }}
      initial={{ top: '-10%' }}
      animate={{ top: '105%' }}
      transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
    />
  )
}

/**
 * CRT power-on, drawn as a separate overlay so the board itself never carries
 * a clip-path or filter (those clipped Teto and left stale paint seams).
 * A bright line opens across the screen, then the shutters part around it.
 */
function CrtBoot() {
  const calm = useCalm()
  const [done, setDone] = useState(false)
  // Safety net: the overlay must never outlive the intro, even if animation
  // frames never arrive (background tab at load, throttled or headless page).
  useEffect(() => {
    const id = window.setTimeout(() => setDone(true), 2000)
    return () => window.clearTimeout(id)
  }, [])
  if (calm || done) return null
  const ease = [0.7, 0, 0.2, 1] as const
  const shutter = 'absolute inset-x-0 bg-[#2a0f14]'
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0" style={{ zIndex: 60 }}>
      <motion.div className={`${shutter} top-0 h-1/2`} initial={{ y: 0 }} animate={{ y: '-100%' }} transition={{ duration: 0.5, delay: 0.32, ease }} />
      <motion.div
        className={`${shutter} bottom-0 h-1/2`}
        initial={{ y: 0 }}
        animate={{ y: '100%' }}
        transition={{ duration: 0.5, delay: 0.32, ease }}
        onAnimationComplete={() => setDone(true)}
      />
      <motion.div
        className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2"
        style={{ background: 'var(--color-paper)', boxShadow: '0 0 24px 6px rgb(244 240 241 / 0.75)' }}
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
        transition={{ duration: 0.75, times: [0, 0.42, 1], ease }}
      />
    </div>
  )
}

/** Portrait phone: the board is the same picture, the visitor turns the phone. */
function RotateHint() {
  const { t } = useI18n()
  return (
    <p className="rotate-hint m-0 items-center gap-2 font-sans text-sm text-paper/85" role="note">
      <DeviceRotate weight="bold" size={20} className="rotate-hint-icon" aria-hidden />
      {t(dict.a11y.rotate)}
    </p>
  )
}

export default function App() {
  const calm = useCalm()
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const pointer = {
    x: useSpring(rawX, { stiffness: 70, damping: 18, mass: 0.6 }),
    y: useSpring(rawY, { stiffness: 70, damping: 18, mass: 0.6 }),
  }
  const [fine, setFine] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (min-width: 900px)')
    const sync = () => setFine(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  const track = (e: PointerEvent) => {
    if (calm || !fine) return
    rawX.set((e.clientX / window.innerWidth - 0.5) * 2)
    rawY.set((e.clientY / window.innerHeight - 0.5) * 2)
  }
  useEffect(() => {
    if (calm || !fine) {
      rawX.set(0)
      rawY.set(0)
    }
  }, [calm, fine, rawX, rawY])

  return (
    <PointerContext.Provider value={pointer}>
    <main className="page" onPointerMove={track} onPointerLeave={() => { rawX.set(0); rawY.set(0) }}>
      <div className="stage">
        <div className="canvas">
          <LocaleSweep />
          <Slot x={410} y={0} depth={0.5}>
            <CableLoop />
          </Slot>

          <Slot x={12} y={10}>
            <ProfileCard />
          </Slot>
          <Slot x={205} y={11}>
            <SpecStrip />
          </Slot>
          <Slot x={205} y={73}>
            <ChartTile />
          </Slot>
          <Slot x={413} y={28} z={1}>
            <GfxCard />
          </Slot>
          <Slot x={486} y={15} z={2}>
            <SquareTile />
          </Slot>
          <Slot x={492} y={104} z={3}>
            <CameraToggles />
          </Slot>
          <Slot x={578} y={12}>
            <NameRail />
          </Slot>
          <Slot x={625} y={12}>
            <BellCard />
          </Slot>

          <Slot x={15} y={189}>
            <SongsCard />
          </Slot>
          <Slot x={107} y={190}>
            <GameStrip />
          </Slot>
          <Slot x={106} y={230}>
            <TwinSliders />
          </Slot>
          <Slot x={196} y={192}>
            <LoadingWindow />
          </Slot>
          <Slot x={106} y={364}>
            <ClockBar />
          </Slot>

          <Slot x={418} y={190}>
            <MessagePanel />
          </Slot>
          <Slot x={400} y={243}>
            <DocumentRows />
          </Slot>
          <Slot x={465} y={296}>
            <MonogramPlate />
          </Slot>
          <Slot x={542} y={188}>
            <p
              lang="ja"
              className="m-0 font-jp font-bold text-paper"
              style={{ fontSize: u(16), lineHeight: 1, writingMode: 'vertical-rl', textShadow: `${u(0.8)} ${u(0.8)} 0 var(--color-maroon)` }}
            >
              重音テト
            </p>
          </Slot>

          <Slot x={578} y={163} z={1}>
            <SystemDialog />
          </Slot>
          <Slot x={540} y={262}>
            <PictureWindow />
          </Slot>


          {/* Teto sits above the panels, exactly where the edit has her. */}
          <Slot x={126} y={-3} z={5} depth={-1.6} className="teto-slot pointer-events-none" style={{ width: `${(515 / 736) * 100}%` }}>
            <Teto />
          </Slot>

          {sparkles.map((s, i) => (
            <div key={i} className="slot" style={place(s.x, s.y)}>
              <span className="twinkle absolute" style={{ animationDelay: `${i * 0.7}s` }}>
                <Sparkle size={s.s} style={{ left: u(-s.s / 2), top: u(-s.s / 2) }} />
              </span>
            </div>
          ))}
        </div>
      </div>
      <RotateHint />
      <div className="dust" aria-hidden />
      <div className="vignette" aria-hidden />
      <div className="grain" aria-hidden />
      <CrtBoot />
    </main>
    </PointerContext.Provider>
  )
}
