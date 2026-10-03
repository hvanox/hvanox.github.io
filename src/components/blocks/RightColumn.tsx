import { ArrowsOut, Bell, Heart, Minus, Shuffle, SkipBack, Square, TextAa, X } from '@phosphor-icons/react'
import { AnimatePresence, motion, useAnimationControls } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'
import art from '../../content/art.json'
import { dict } from '../../content/dict'
import { achievements } from '../../content/profile'
import { updates } from '../../content/updates'
import { useCalm } from '../../lib/calm'
import { useI18n } from '../../lib/i18n'
import { EASE, bevel, box, ring, sh, u } from '../../lib/u'
import { useNow } from '../../lib/use-now'
import { Modal } from '../ui/Modal'
import { Press } from '../ui/primitives'

/** Window-chrome square: ink fill, paper hairline. */
function Chrome({ label, children, onClick, pressed }: { label: string; children: ReactNode; onClick?: () => void; pressed?: boolean }) {
  return (
    <Press
      label={label}
      onClick={onClick}
      pressed={pressed}
      className="bg-ink text-paper transition-colors duration-200 hover:bg-rose"
      style={{ ...box(10, 10), boxShadow: sh(`inset 0 0 0 ${u(0.8)} var(--color-paper)`, `inset 0 0 0 ${u(1.6)} var(--color-ink)`) }}
    >
      {children}
    </Press>
  )
}

/** Cream title bar with a raised bevel. */
function TitleBar({ children, h }: { children: ReactNode; h: number }) {
  return (
    <div
      className="flex items-center bg-cream text-ink"
      style={{ height: u(h), padding: `0 ${u(3)}`, gap: u(4), boxShadow: sh(ring(1, 'var(--color-paper)'), bevel(1)) }}
    >
      {children}
    </div>
  )
}

/** Bell card "Success!" → achievements; the bell rings to the next one, auto-cycles otherwise. */
export function BellCard() {
  const { t } = useI18n()
  const calm = useCalm()
  const bell = useAnimationControls()
  const [index, setIndex] = useState(0)
  const [hold, setHold] = useState(false)
  const item = achievements[index]
  const result = t(item.result)

  useEffect(() => {
    if (hold || calm) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % achievements.length), 4500)
    return () => window.clearInterval(id)
  }, [hold, calm])

  const next = () => {
    setIndex((i) => (i + 1) % achievements.length)
    if (!calm) bell.start({ rotate: [0, -18, 15, -10, 6, -2, 0], transition: { duration: 0.8, ease: 'easeOut' } })
  }

  return (
    <section
      aria-label={t(dict.achievements.label)}
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      className="relative overflow-hidden"
      style={{ ...box(97, 146), borderRadius: u(12), boxShadow: ring(1.2, 'var(--color-paper)') }}
    >
      <div className="absolute inset-x-0 top-0 bg-cream" style={{ height: u(92) }} />
      <div className="absolute inset-x-0 bottom-0 bg-maroon" style={{ top: u(92), boxShadow: `inset 0 ${u(1)} 0 var(--color-paper)` }} />
      <Press
        label={`${t(dict.achievements.next)}: ${t(achievements[(index + 1) % achievements.length].title)}`}
        onClick={next}
        className="absolute rounded-full"
        style={{ ...box(66, 66), left: u(15.5), top: u(14), boxShadow: sh(`inset 0 0 0 ${u(2.2)} var(--color-ink)`, ring(1.2, 'var(--color-paper)')) }}
      >
        <motion.span animate={bell} style={{ transformOrigin: '50% 12%' }} className="grid place-items-center">
          <Bell weight="fill" size={u(27)} color="var(--color-maroon)" />
        </motion.span>
      </Press>
      <div aria-live="polite" className="absolute inset-x-0 flex flex-col items-center" style={{ top: u(98), paddingInline: u(4) }}>
        <p
          key={item.id}
          className="rise m-0 grid place-items-center text-center font-sans font-bold whitespace-nowrap text-paper"
          style={{ height: u(24), fontSize: u(result.length > 10 ? 9.5 : 14), lineHeight: 1 }}
        >
          {result}!
        </p>
        <p className="m-0 max-w-full truncate font-sans" style={{ fontSize: u(5.2), color: '#9c6b74' }}>
          {t(item.title)} · {item.year}
        </p>
      </div>
    </section>
  )
}

/** System Message → build log; Ok steps forward, Cancel back, X collapses. */
export function SystemDialog() {
  const { locale, t } = useI18n()
  const [open, setOpen] = useState(true)
  const ordered = [...updates].reverse()
  const [index, setIndex] = useState(0)
  const entry = ordered[index]
  const date = new Date(`${entry.date}T00:00:00`).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })
  const step = (d: number) => setIndex((i) => (i + d + ordered.length) % ordered.length)

  return (
    <section className="relative" style={{ width: u(147) }} aria-labelledby="system-title">
      <TitleBar h={15}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 cursor-pointer items-center justify-between border-0 bg-transparent p-0 font-sans text-ink"
        >
          <h2 id="system-title" className="m-0 truncate font-normal" style={{ fontSize: u(7.4) }}>
            {t(dict.system.title)}.
          </h2>
          <span className="tabular-nums opacity-70" style={{ fontSize: u(5) }}>
            {index + 1}/{ordered.length}
          </span>
        </button>
        <Chrome label={t(dict.a11y.close)} onClick={() => setOpen(false)}>
          <X weight="bold" size={u(7)} />
        </Chrome>
      </TitleBar>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="overflow-hidden"
          >
            <div
              className="relative bg-maroon"
              style={{
                height: u(78),
                boxShadow: sh(`inset 0 0 0 ${u(1)} var(--color-paper)`, `inset 0 0 0 ${u(3)} var(--color-maroon)`, `inset 0 0 0 ${u(3.7)} #7b3e48`),
              }}
            >
              <div aria-live="polite" className="absolute flex flex-col items-center justify-center text-center text-cream-hi" style={{ left: u(10), right: u(10), top: u(5), height: u(40) }}>
                <p key={entry.id} className="rise m-0 font-sans italic" style={{ fontSize: u(5.6), lineHeight: 1.3 }}>
                  {t(entry.body)}
                </p>
                <time dateTime={entry.date} className="font-mono opacity-55" style={{ fontSize: u(3.8), marginTop: u(1.5) }}>
                  {date}
                </time>
              </div>
              <div className="absolute flex justify-between" style={{ left: u(22), right: u(22), bottom: u(12) }}>
                {[
                  { label: t(dict.system.ok), d: 1 },
                  { label: t(dict.system.cancel), d: -1 },
                ].map((b) => (
                  <Press
                    key={b.d}
                    label={b.label}
                    onClick={() => step(b.d)}
                    className="font-sans text-cream-hi transition-colors duration-200 hover:bg-ink"
                    style={{
                      ...box(40, 19),
                      fontSize: u(7),
                      background: 'rgb(63 26 32 / 0.35)',
                      boxShadow: sh(`inset 0 0 0 ${u(0.9)} #8b4a54`, `inset 0 0 0 ${u(1.8)} var(--color-ink)`),
                    }}
                  >
                    {b.label}
                  </Press>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

/** "Virtual Picture." → fan-art shrine with credits, carousel and full view. */
export function PictureWindow() {
  const { t } = useI18n()
  const now = useNow(60_000)
  const [index, setIndex] = useState(art.length - 1)
  const [full, setFull] = useState(false)
  const [tab, setTab] = useState(0)
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const item = art[index]
  const alt = `${t(dict.shrine.artAlt)} ${item.artist}`
  const date = now ? `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}` : '··.··'
  const step = (d: number) => setIndex((i) => (i + d + art.length) % art.length)
  const random = () =>
    setIndex((i) => {
      const n = Math.floor(Math.random() * (art.length - 1))
      return n >= i ? n + 1 : n
    })

  const tiles = [
    { label: t(dict.player.like), Icon: Heart, onClick: () => setLiked((p) => ({ ...p, [item.src]: !p[item.src] })), pressed: Boolean(liked[item.src]) },
    { label: t(dict.shrine.random), Icon: Shuffle, onClick: random },
    { label: t(dict.shrine.open), Icon: ArrowsOut, onClick: () => setFull(true) },
    { label: t(dict.shrine.prev), Icon: SkipBack, onClick: () => step(-1) },
  ]

  return (
    <section className="relative" style={box(185, 143)} aria-labelledby="picture-title">
      <TitleBar h={20}>
        <span
          aria-hidden
          className="grid shrink-0 place-items-center bg-cream-hi"
          style={{ ...box(14, 14), borderRadius: u(2), boxShadow: sh(`inset 0 0 0 ${u(0.9)} var(--color-ink)`, ring(0.8, 'var(--color-paper)')) }}
        >
          <TextAa weight="bold" size={u(8)} color="var(--color-ink)" />
        </span>
        <h2 id="picture-title" className="m-0 min-w-0 flex-1 truncate font-sans font-normal" style={{ fontSize: u(9) }}>
          {t(dict.shrine.title)}
        </h2>
        <span aria-hidden className="block bg-ink" style={box(0.9, 12)} />
        <span className="font-sans tabular-nums" style={{ fontSize: u(9), marginLeft: u(-2) }}>
          {date}
        </span>
        <span className="flex" style={{ gap: u(1.5) }}>
          <Chrome label={t(dict.shrine.prev)} onClick={() => step(-1)}>
            <Minus weight="bold" size={u(7)} />
          </Chrome>
          <Chrome label={t(dict.shrine.open)} onClick={() => setFull(true)}>
            <Square weight="bold" size={u(7)} />
          </Chrome>
          <Chrome label={t(dict.shrine.next)} onClick={() => step(1)}>
            <X weight="bold" size={u(7)} />
          </Chrome>
        </span>
      </TitleBar>
      <div
        className="absolute bg-maroon"
        style={{ left: u(3), right: 0, top: u(22), bottom: 0, boxShadow: sh(ring(1, 'var(--color-paper)'), `inset 0 0 0 ${u(3)} var(--color-maroon)`, `inset 0 0 0 ${u(3.8)} #7b3e48`) }}
      >
        <div
          className="absolute flex items-stretch"
          style={{ left: u(5), right: u(5), top: u(6), height: u(13), boxShadow: `inset 0 ${u(-0.9)} 0 #8b4a54, inset 0 ${u(0.9)} 0 #8b4a54` }}
        >
          {[dict.shrine.menu.file, dict.shrine.menu.action, dict.shrine.menu.help].map((m, i) => (
            <button
              key={i}
              type="button"
              aria-pressed={tab === i}
              onClick={() => setTab(i)}
              className="grid cursor-pointer place-items-center border-0 p-0 font-sans text-cream-hi transition-colors duration-200"
              style={{
                paddingInline: u(4),
                fontSize: u(5.6),
                background: tab === i ? 'rgb(63 26 32 / 0.7)' : 'transparent',
                boxShadow: `inset ${u(-0.9)} 0 0 #8b4a54, inset ${u(0.9)} 0 0 #8b4a54`,
              }}
            >
              {t(m)}
            </button>
          ))}
          <span className="ml-auto self-center truncate font-sans text-cream-hi/70" style={{ fontSize: u(3.8), paddingRight: u(3), maxWidth: u(56) }}>
            {t(dict.shrine.credit)} {item.artist}
          </span>
        </div>
        <button
          type="button"
          aria-label={`${t(dict.shrine.open)}: ${alt}`}
          onClick={() => setFull(true)}
          className="absolute cursor-zoom-in overflow-hidden border-0 bg-paper p-0"
          style={{ left: u(4), top: u(20), width: u(112), bottom: u(8), boxShadow: ring(0.8, '#7b3e48') }}
        >
          <img key={item.src} src={item.src} alt={alt} width={item.width} height={item.height} className="rise block size-full object-cover" loading="lazy" />
        </button>
        <div className="absolute flex flex-col" style={{ left: u(124), top: u(26), gap: u(5) }}>
          {[
            { label: t(dict.shrine.next), d: 1 },
            { label: t(dict.shrine.prev), d: -1 },
          ].map((b) => (
            <Press
              key={b.d}
              label={b.label}
              onClick={() => step(b.d)}
              className="bg-cream font-sans text-ink transition-colors duration-200 hover:bg-cream-hi"
              style={{ ...box(46, 12), fontSize: u(7.6), boxShadow: sh(ring(0.8, 'var(--color-ink)'), bevel(1)) }}
            >
              {b.label}
            </Press>
          ))}
        </div>
        <div className="absolute grid grid-cols-2" style={{ left: u(124), top: u(61), gap: u(2) }}>
          {tiles.map(({ label, Icon, onClick, pressed }) => (
            <Press
              key={label}
              label={label}
              onClick={onClick}
              pressed={pressed}
              className="transition-colors duration-200 hover:bg-ink"
              style={{
                ...box(22, 23),
                background: pressed ? 'rgb(244 240 241 / 0.25)' : undefined,
                boxShadow: sh(`inset 0 0 0 ${u(1)} #8b4a54`, `inset 0 0 0 ${u(1.8)} var(--color-ink)`),
              }}
            >
              <Icon weight={pressed ? 'fill' : 'bold'} size={u(13)} color="var(--color-paper)" />
            </Press>
          ))}
        </div>
      </div>
      <Modal open={full} onClose={() => setFull(false)} closeLabel={t(dict.a11y.close)} title={t(dict.shrine.title)} wide>
        <img src={item.src} alt={alt} width={item.width} height={item.height} className="mx-auto block max-h-[72dvh] w-auto max-w-full object-contain" />
        <p className="mt-3 mb-0 font-mono text-xs text-cream-hi">
          {t(dict.shrine.credit)} {item.artist}
        </p>
      </Modal>
    </section>
  )
}

/** KASANE TETO vertical lettering with its rules. */
export function NameRail() {
  return (
    <div className="relative" style={box(44, 150)}>
      <span aria-hidden className="absolute block bg-paper" style={{ ...box(1.4, 72), left: u(28), top: 0 }} />
      <span aria-hidden className="absolute block bg-paper" style={{ ...box(1.4, 36), left: u(7), top: u(112) }} />
      <p
        className="stroke-letters absolute m-0 font-display font-black"
        style={{ left: u(-2), top: u(0), fontSize: u(19), lineHeight: 1, writingMode: 'vertical-rl', textOrientation: 'upright', letterSpacing: '-0.24em' }}
      >
        KASANE
      </p>
      <p
        className="stroke-letters absolute m-0 font-display font-black"
        style={{ left: u(20), top: u(74), fontSize: u(19), lineHeight: 1, writingMode: 'vertical-rl', textOrientation: 'upright', letterSpacing: '-0.24em' }}
      >
        TETO
      </p>
    </div>
  )
}
