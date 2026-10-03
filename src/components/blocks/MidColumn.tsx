import { FolderSimple, GearSix } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { dict } from '../../content/dict'
import { profile } from '../../content/profile'
import { useDialogs } from '../../lib/dialogs'
import { useI18n } from '../../lib/i18n'
import { formatTime, usePlayer } from '../../lib/player'
import { EASE, bevel, box, ring, sh, u } from '../../lib/u'
import { ageAt, daysSince, useNow } from '../../lib/use-now'
import { Press } from '../ui/primitives'

/** "Game" of Gear → days on Earth; the gear cluster opens the stack. */
export function GameStrip() {
  const { locale, t } = useI18n()
  const { show } = useDialogs()
  const now = useNow(60_000)
  const [spin, setSpin] = useState(0)
  const days = now ? daysSince(profile.born, now).toLocaleString(locale) : '····'
  return (
    <div
      className="relative flex bg-cream text-ink"
      style={{ ...box(82, 32), boxShadow: sh(ring(1, 'var(--color-cream-hi)'), `inset 0 0 0 ${u(0.8)} var(--color-shade)`) }}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center" style={{ paddingLeft: u(4) }}>
        <span className="font-sans tabular-nums" style={{ fontSize: u(10), lineHeight: 1 }}>
          &ldquo;{days}&rdquo;
        </span>
        <span className="truncate font-sans" style={{ fontSize: u(4.6), marginTop: u(1.5) }}>
          __ {t(dict.profile.days)}
        </span>
      </div>
      <Press
        label={t(dict.stack.open)}
        onClick={() => {
          setSpin((s) => s + 1)
          show('stack')
        }}
        className="relative shrink-0 bg-maroon"
        style={{ ...box(27, 27), margin: u(2.5), boxShadow: `inset 0 0 0 ${u(0.8)} #7b3e48` }}
      >
        <motion.span className="relative block" style={box(20, 18)} animate={{ rotate: spin * 120 }} transition={{ duration: 0.7, ease: EASE }}>
          <GearSix weight="bold" size={u(10)} color="var(--color-cream-hi)" className="absolute" style={{ left: u(9), top: 0 }} />
          <GearSix weight="bold" size={u(9)} color="var(--color-cream-hi)" className="absolute" style={{ left: 0, top: u(5) }} />
          <GearSix weight="bold" size={u(9)} color="var(--color-cream-hi)" className="absolute" style={{ left: u(8), top: u(9) }} />
        </motion.span>
      </Press>
    </div>
  )
}

/**
 * Vertical pill slider on a native range input (keyboard + screen readers for free).
 * While dragging the value lives here; `commit="release"` sends it once on let-go
 * (seeking YouTube on every pixel stalls the page), `commit="live"` throttles.
 */
function VRange({
  label,
  caption,
  value,
  max,
  valueText,
  onChange,
  disabled,
  commit,
}: {
  label: string
  caption: string
  value: number
  max: number
  valueText: (v: number) => string
  onChange: (v: number) => void
  disabled?: boolean
  commit: 'release' | 'live'
}) {
  const [draft, setDraft] = useState<number | null>(null)
  const draftRef = useRef<number | null>(null)
  const last = useRef(0)
  const shown = draft ?? value
  const fill = Math.max(0, Math.min(1, shown / max))

  // Latest onChange for the window listener, synced outside render.
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const finish = useCallback(() => {
    if (draftRef.current !== null) onChangeRef.current(draftRef.current)
    draftRef.current = null
    setDraft(null)
  }, [])

  // The pointer can be released anywhere on the page, not only over the pill.
  const dragging = draft !== null
  useEffect(() => {
    if (!dragging) return
    const end = () => finish()
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
    return () => {
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
    }
  }, [dragging, finish])

  return (
    <label
      className="relative block overflow-hidden bg-cream"
      style={{
        ...box(34, 128),
        borderRadius: u(11),
        boxShadow: sh(ring(1.2, 'var(--color-cream-hi)'), 'inset calc(var(--u)*1.5) calc(var(--u)*1.5) 0 rgb(244 240 241 / 0.5)'),
      }}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 bg-maroon"
        style={{
          height: '100%',
          transformOrigin: '50% 100%',
          transform: `scaleY(${(22 + fill * 100) / 128})`,
          transition: draft === null ? 'transform 400ms linear' : 'none',
          willChange: 'transform',
          borderTopLeftRadius: `50% ${u(5)}`,
          borderTopRightRadius: `50% ${u(5)}`,
          boxShadow: sh(`inset 0 ${u(1.4)} 0 var(--color-rose)`, `inset 0 ${u(-3)} ${u(4)} rgb(63 26 32 / 0.5)`),
        }}
      />
      <span aria-hidden className="absolute inset-x-0 text-center font-sans" style={{ bottom: u(6), fontSize: u(6.2), color: '#b77a83' }}>
        {caption}
      </span>
      <span className="sr-only">{label}</span>
      <input
        type="range"
        min={0}
        max={max}
        value={shown}
        aria-valuetext={valueText(shown)}
        disabled={disabled}
        onChange={(e) => {
          const v = Number(e.target.value)
          draftRef.current = v
          setDraft(v)
          if (commit === 'live') {
            const now = performance.now()
            if (now - last.current > 80) {
              last.current = now
              onChange(v)
            }
          }
        }}
        onKeyUp={finish}
        onBlur={finish}
        className="absolute inset-0 size-full cursor-ns-resize opacity-0 disabled:cursor-not-allowed"
        style={{ writingMode: 'vertical-lr', direction: 'rtl', touchAction: 'none' }}
      />
    </label>
  )
}

/** Twin pills → track progress and volume. */
export function TwinSliders() {
  const { t } = useI18n()
  const { time, duration, seek, volume, setVolume, availability } = usePlayer()
  return (
    <div className="flex" style={{ gap: u(13), width: u(82) }}>
      <VRange
        label={t(dict.player.progress)}
        caption={t(dict.player.track)}
        value={Math.round(time)}
        max={Math.max(1, Math.round(duration))}
        valueText={(v) => `${formatTime(v)} / ${formatTime(duration)}`}
        onChange={seek}
        disabled={availability === 'missing' || duration <= 0}
        commit="release"
      />
      <VRange
        label={t(dict.player.volume)}
        caption={t(dict.player.vol)}
        value={volume}
        max={100}
        valueText={(v) => `${v}%`}
        onChange={setVolume}
        commit="live"
      />
    </div>
  )
}

/** Loading window → now playing + profile folder (age, born, status). */
export function LoadingWindow() {
  const { t } = useI18n()
  const { show } = useDialogs()
  const now = useNow(60_000)
  const { track, playing, time, duration } = usePlayer()
  const progress = duration > 0 ? Math.min(1, time / duration) : 0
  const [year, month, day] = profile.born.split('-')
  const rows = [
    `${t(dict.profile.age)} : ${now ? ageAt(profile.born, now) : '··'}`,
    `${t(dict.profile.born)} : ${day}.${month}.${year}`,
    `${t(dict.profile.status)} : ${playing ? t(dict.profile.listening) : t(dict.profile.alive)}`,
  ]
  const lines = [44, 70, 95, 120]

  return (
    <div className="relative bg-cream" style={{ ...box(127, 162), boxShadow: sh(ring(1, 'var(--color-cream-hi)'), bevel(1)) }}>
      <div
        className="absolute flex items-center overflow-hidden bg-maroon font-mono text-cream-hi"
        style={{
          left: u(7),
          right: u(26),
          top: u(4),
          height: u(10),
          paddingInline: u(3),
          fontSize: u(5.4),
          boxShadow: sh(`inset 0 0 0 ${u(0.8)} var(--color-paper)`, `inset ${u(1.6)} ${u(1.6)} 0 var(--color-ink)`),
        }}
        role="progressbar"
        aria-label={t(dict.player.progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <span className="truncate">
          {t(dict.profile.loading)} <span className="opacity-70">{track.title}</span>
        </span>
        <span aria-hidden className="absolute bottom-0 left-0 bg-cream-hi/70 transition-[width] duration-500 ease-linear" style={{ height: u(1), width: `${progress * 100}%` }} />
      </div>
      <div
        className="absolute bg-maroon"
        style={{
          left: u(5),
          right: u(5),
          top: u(18),
          bottom: u(5),
          boxShadow: sh(`inset 0 0 0 ${u(3)} var(--color-maroon)`, `inset 0 0 0 ${u(3.8)} var(--color-rose)`, `inset 0 0 0 ${u(4)} var(--color-maroon)`),
        }}
      >
        <Press
          label={t(dict.experience.title)}
          onClick={() => show('experience')}
          className="absolute"
          style={{ left: u(8), top: u(6), ...box(30, 30), background: 'transparent', opacity: 0.7 }}
        >
          <FolderSimple weight="bold" size={u(26)} color="#8d4652" />
        </Press>
        {lines.map((y, i) => (
          <div key={i} className="absolute" style={{ left: u(4), right: u(4), top: u(y) }}>
            <div style={{ height: u(0.9), background: 'var(--color-rose)', opacity: 0.85 }} />
            {rows[i] && (
              <p
                aria-live={i === 2 ? 'polite' : undefined}
                className="m-0 truncate font-sans text-cream-hi"
                style={{ fontSize: u(8.2), lineHeight: 1, margin: `${u(8)} 0 0 ${u(5)}` }}
              >
                {rows[i]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/** "[+] 6:30:00 PM" → local clock; [+] toggles 12/24h. */
export function ClockBar() {
  const { locale, t } = useI18n()
  const now = useNow(1000)
  const [h12, setH12] = useState(true)
  const text = now
    ? now.toLocaleTimeString(h12 ? 'en-US' : locale, { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: h12 })
    : '--:--:--'
  return (
    <div
      className="relative flex items-center bg-maroon"
      style={{
        ...box(170, 38),
        gap: u(4),
        paddingLeft: u(7),
        boxShadow: sh(ring(1, 'var(--color-cream-hi)'), `inset 0 0 0 ${u(2.4)} var(--color-maroon)`, `inset 0 0 0 ${u(3)} #7b3e48`),
      }}
    >
      <Press
        label={t(dict.clock.toggle)}
        pressed={!h12}
        onClick={() => setH12((v) => !v)}
        className="shrink-0 font-sans text-paper"
        style={{ fontSize: u(21), lineHeight: 1, background: 'transparent', ...box(31, 28) }}
      >
        [+]
      </Press>
      <time
        aria-label={t(dict.clock.label)}
        dateTime={now?.toISOString()}
        className="whitespace-nowrap font-sans text-paper tabular-nums"
        style={{ fontSize: u(19), lineHeight: 1 }}
      >
        {text}
      </time>
    </div>
  )
}
