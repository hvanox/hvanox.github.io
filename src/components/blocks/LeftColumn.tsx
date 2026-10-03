import { Atom, ChartPieSlice, Clover, GearFine } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import art from '../../content/art.json'
import { dict } from '../../content/dict'
import { playlist } from '../../content/playlist'
import { profile, stack } from '../../content/profile'
import { useDialogs } from '../../lib/dialogs'
import { useI18n } from '../../lib/i18n'
import { usePlayer } from '../../lib/player'
import { bevel, box, ring, sh, u } from '../../lib/u'
import { usePlayerDialog } from '../player/PlayerDialog'
import { Press } from '../ui/primitives'

type Art = (typeof art)[number]
const portraits = art.filter((a) => a.ratio === 'portrait')
const squares = art.filter((a) => a.ratio === 'square')

/** Photo frame: white mat, grey hairline, fan art inside. */
function Frame({ w, h, x, y, r = 9, item, alt }: { w: number; h: number; x: number; y: number; r?: number; item: Art; alt: string }) {
  return (
    <div
      className="absolute overflow-hidden bg-paper"
      style={{
        ...box(w, h),
        left: u(x),
        top: u(y),
        borderRadius: u(r),
        padding: u(3),
        boxShadow: sh(`inset 0 0 0 ${u(1)} var(--color-shade)`),
      }}
    >
      <img
        key={item.src}
        src={item.src}
        alt={alt}
        title={alt}
        width={item.width}
        height={item.height}
        className="rise block size-full object-cover"
        style={{ borderRadius: u(r - 3) }}
        loading="lazy"
      />
    </div>
  )
}

/** "Lucky Girl" card: role, short bio, two framed arts, handle in script. */
export function ProfileCard() {
  const { t } = useI18n()
  const { show } = useDialogs()
  const [i, setI] = useState(0)
  const portrait = portraits[i % portraits.length]
  const square = squares[i % squares.length]
  const step = (d: number) => setI((n) => (n + d + 60) % 60)

  const clover = (side: 'left' | 'right') => (
    <Press
      label={side === 'left' ? t(dict.shrine.prev) : t(dict.shrine.next)}
      onClick={() => step(side === 'left' ? -1 : 1)}
      className="absolute rounded-full bg-cream transition-colors duration-300 hover:bg-cream-hi"
      style={{
        ...box(25, 25),
        top: u(86),
        [side]: u(-7),
        boxShadow: sh(ring(1.6, 'var(--color-cream-hi)'), ring(2.6, 'rgb(63 26 32 / 0.25)'), 'inset 0 calc(var(--u)*-1.5) 0 rgb(63 26 32 / 0.12)'),
      }}
    >
      <Clover weight="fill" size={u(16)} color="var(--color-maroon)" style={{ transform: 'rotate(-45deg)' }} />
    </Press>
  )

  return (
    <section className="relative" style={box(186, 166)} aria-label={profile.handle}>
      <div
        className="absolute inset-0 bg-maroon"
        style={{ borderRadius: u(11), boxShadow: sh(`inset 0 0 0 ${u(1.2)} #6e3a44`, ring(0.6, 'rgb(63 26 32 / 0.5)')) }}
      />
      <Frame w={83} h={146} x={8} y={11} r={10} item={portrait} alt={`${t(dict.shrine.artAlt)} ${portrait.artist}`} />
      <h1
        className="absolute m-0 grid place-items-center bg-cream font-sans font-bold text-ink"
        style={{ ...box(72, 12), left: u(102), top: u(9), fontSize: u(t(profile.role).length > 16 ? 6 : 7.2), boxShadow: sh(ring(0.7, 'var(--color-shade)'), bevel(0.9)) }}
      >
        <span className="sr-only">{profile.handle}: </span>
        <span className="truncate">{t(profile.role)}</span>
      </h1>
      <p
        className="absolute m-0 grid place-items-center text-center font-sans font-bold text-cream-hi"
        style={{ left: u(94), top: u(25), width: u(90), height: u(31), fontSize: u(4.5), lineHeight: 1.32, letterSpacing: '0.02em' }}
      >
        {t(dict.about.short)}
      </p>
      <Frame w={81} h={73} x={98} y={58} r={8} item={square} alt={`${t(dict.shrine.artAlt)} ${square.artist}`} />
      <Press
        label={t(dict.about.more)}
        onClick={() => show('about')}
        className="absolute font-script text-cream-hi"
        style={{ left: u(98), top: u(134), width: u(82), height: u(28), fontSize: u(25), lineHeight: 1, background: 'transparent' }}
      >
        {profile.handle}
      </Press>
      {clover('left')}
      {clover('right')}
    </section>
  )
}

/** STEAMPUNK strip → stack summary; opens the full list. */
export function SpecStrip() {
  const { t } = useI18n()
  const { show } = useDialogs()
  const total = stack.reduce((sum, g) => sum + g.items.length, 0)
  return (
    <button
      type="button"
      aria-label={t(dict.stack.open)}
      onClick={() => show('stack')}
      className="relative block cursor-pointer border-0 bg-cream p-0 text-left text-ink transition-[filter] duration-200 hover:brightness-105"
      style={{
        ...box(117, 56),
        boxShadow: sh(ring(1, 'var(--color-cream-hi)'), `inset 0 0 0 ${u(2)} var(--color-cream)`, `inset 0 0 0 ${u(2.6)} var(--color-ink)`),
      }}
    >
      <span className="absolute flex items-center justify-between font-mono uppercase" style={{ left: u(7), top: u(4), right: u(7), fontSize: u(4.2) }}>
        <span className="font-bold italic">{t(dict.stack.title)}</span>
        <span>___@{profile.handle}</span>
        <span className="tabular-nums">({total})</span>
      </span>
      <span className="absolute bg-ink" style={{ left: u(5), right: u(5), top: u(11), height: u(0.6) }} />
      <span className="absolute bg-ink" style={{ ...box(2.2, 36), left: u(6), top: u(15) }} />
      <span className="absolute" style={{ ...box(36, 36), left: u(10), top: u(15) }}>
        <GearFine weight="fill" size={u(34)} color="var(--color-ink)" className="absolute left-0 top-0" />
        <Atom weight="bold" size={u(24)} color="var(--color-ink)" className="absolute" style={{ left: u(13), top: u(4) }} />
      </span>
      <span className="absolute flex flex-col font-sans font-bold" style={{ left: u(52), top: u(14), width: u(58), fontSize: u(3.3), lineHeight: 1.3 }}>
        {stack.slice(0, 3).map((g) => (
          <span key={g.group} className="truncate">
            {g.items.join(' ')}
          </span>
        ))}
      </span>
      <span className="barcode absolute opacity-60" style={{ ...box(26, 7), right: u(7), bottom: u(6) }} />
    </button>
  )
}

type GithubUser = { public_repos: number; followers: number }

// Unauthenticated GitHub API allows 60 requests/hour per IP: cache for 10 minutes.
const GH_KEY = 'hvano.github'
function readGithubCache(): GithubUser | null {
  try {
    const cached = JSON.parse(sessionStorage.getItem(GH_KEY) ?? 'null') as { at: number; data: unknown } | null
    return cached && Date.now() - cached.at < 600_000 && isGithubUser(cached.data) ? cached.data : null
  } catch {
    return null
  }
}

/** Only finite non-negative numbers reach the page; anything else counts as a failure. */
function isGithubUser(v: unknown): v is GithubUser {
  const o = v as Record<string, unknown> | null
  return (
    typeof o === 'object' && o !== null &&
    Number.isFinite(o.public_repos) && Number.isFinite(o.followers) &&
    (o.public_repos as number) >= 0 && (o.followers as number) >= 0
  )
}
const login = profile.contacts.github.href.replace(/^https:\/\/github\.com\//, '')

/** "User Interface" tile → live GitHub numbers; the tile links to the profile. */
export function ChartTile() {
  const { t } = useI18n()
  const [data, setData] = useState<GithubUser | null>(readGithubCache)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (data) return
    const ctrl = new AbortController()
    fetch(`https://api.github.com/users/${encodeURIComponent(login)}`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: unknown) => {
        if (!isGithubUser(d)) throw new Error('unexpected github payload')
        const picked = { public_repos: d.public_repos, followers: d.followers }
        setData(picked)
        try {
          sessionStorage.setItem(GH_KEY, JSON.stringify({ at: Date.now(), data: picked }))
        } catch {
          // private mode: no cache
        }
      })
      .catch((e) => {
        if (!ctrl.signal.aborted) setFailed(Boolean(e))
      })
    return () => ctrl.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once per mount
  }, [])

  // No invented numbers: dots while loading, an honest line on failure.
  const text = failed
    ? t(dict.github.unavailable)
    : data
      ? `${data.public_repos} ${t(dict.github.repos)} · ${data.followers} ${t(dict.github.followers)}`
      : '· · ·'

  return (
    <div className="relative" style={box(117, 104)}>
      <div className="absolute bg-field-deep" style={{ inset: 0, transform: `translate(${u(-3)}, ${u(-3)})`, borderRadius: u(12) }} />
      <div className="absolute inset-0 bg-maroon" style={{ borderRadius: u(12), boxShadow: sh(`inset 0 0 0 ${u(1.2)} #6e3a44`) }} />
      <a
        href={profile.contacts.github.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t(dict.github.open)}
        className="absolute grid place-items-center bg-cream transition-[filter] duration-200 hover:brightness-105"
        style={{
          ...box(88, 60),
          left: u(6),
          top: u(7),
          borderRadius: u(9),
          boxShadow: sh(ring(1.2, 'var(--color-cream-hi)'), 'inset 0 calc(var(--u)*-2) 0 rgb(63 26 32 / 0.08)'),
        }}
      >
        <ChartPieSlice weight="bold" size={u(50)} color="var(--color-ink)" />
      </a>
      <p
        aria-live="polite"
        className="absolute m-0 flex items-center truncate font-sans text-ink"
        style={{
          ...box(68, 12),
          left: u(9),
          top: u(77),
          borderRadius: u(6),
          background: '#8e5560',
          boxShadow: sh(`inset 0 0 0 ${u(0.8)} var(--color-ink)`),
          paddingLeft: u(5),
          fontSize: u(5.2),
        }}
      >
        {text}
      </p>
    </div>
  )
}

/** Three-leaf clover: three heart leaves around one point and a curled stem. */
const HEART = 'M0 0 C -4 -4 -10.5 -8 -10.5 -14.5 C -10.5 -19.5 -4.5 -21.5 0 -16 C 4.5 -21.5 10.5 -19.5 10.5 -14.5 C 10.5 -8 4 -4 0 0Z'

function Shamrock({ size }: { size: number }) {
  return (
    <svg aria-hidden viewBox="-24 -24 48 48" style={box(size, size)} className="block overflow-visible">
      {[0, 120, 240].map((deg) => (
        <path key={deg} d={HEART} transform={`rotate(${deg}) translate(0 1) scale(1.12)`} fill="var(--color-maroon)" />
      ))}
      <path d="M1 3 C 2 11, 3 17, 9 21" fill="none" stroke="var(--color-maroon)" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  )
}

/** "Aisana Songs" card → mini player: badge opens the player, pills pick tracks, lyrics roll. */
export function SongsCard() {
  const { t } = useI18n()
  const { setOpen } = usePlayerDialog()
  const { track, time, duration, select } = usePlayer()
  const tags = [
    { x: 3, y: 140, w: 26, pill: false },
    { x: 42, y: 142, w: 38, pill: true },
    { x: 35, y: 158, w: 26, pill: false },
    { x: 3, y: 175, w: 26, pill: false },
    { x: 42, y: 177, w: 38, pill: true },
    { x: 35, y: 192, w: 26, pill: false },
  ]
  // Lyric line chosen proportionally to playback position: there are no timecodes.
  const lines = track.lyrics
  const at = lines.length > 0 && duration > 0 ? Math.min(lines.length - 1, Math.floor((time / duration) * lines.length)) : 0
  const visible = lines.length > 0 ? lines.slice(at, at + 4) : [track.title, track.artist]

  return (
    <section
      className="relative bg-maroon"
      style={{ ...box(82, 213), borderRadius: u(3), boxShadow: sh(`inset 0 0 0 ${u(1)} #6e3a44`) }}
      aria-label={t(dict.player.songs)}
    >
      <h2 className="absolute m-0 flex items-baseline justify-between font-script font-normal text-cream-hi" style={{ left: u(4), right: u(4), top: u(2), fontSize: u(11), lineHeight: 1.1 }}>
        <span>Teto</span>
        <span
          aria-hidden
          className="block self-start rounded-full"
          style={{ ...box(9, 9), marginTop: u(1), background: '#c4505b', boxShadow: ring(0.8, '#d7737c') }}
        />
        <span>{t(dict.player.songs)}</span>
      </h2>
      <Press
        label={t(dict.player.open)}
        onClick={() => setOpen(true)}
        className="absolute rounded-full"
        style={{ ...box(66, 66), left: u(8), top: u(19), background: 'transparent' }}
      >
        <span
          className="absolute rounded-full bg-cream"
          style={{ ...box(59, 59), left: u(3), top: u(3.5), boxShadow: sh(ring(1.2, 'var(--color-cream-hi)')) }}
        />
        <svg aria-hidden viewBox="0 0 66 66" className="absolute inset-0" style={box(66, 66)}>
          <path d="M44 4 A31 31 0 0 1 36 64" fill="none" stroke="var(--color-cream-hi)" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M26 64 L 33 64" stroke="var(--color-cream-hi)" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span className="absolute grid place-items-center" style={{ left: u(11), top: u(10) }}>
          <Shamrock size={44} />
        </span>
        {[
          [16, 42],
          [48, 42],
          [44, 22],
          [20, 20],
        ].map(([x, y], i) => (
          <span key={i} className="absolute block rounded-full bg-maroon" style={{ ...box(2.4, 2.4), left: u(x), top: u(y) }} />
        ))}
      </Press>
      <div aria-live="polite" className="absolute flex flex-col justify-center text-center font-jp text-cream-hi" style={{ left: u(5), right: u(5), top: u(100), height: u(37) }}>
        {visible.map((line, i) => (
          <p key={`${at}-${i}`} className="m-0 truncate" style={{ fontSize: u(4), lineHeight: 1.5, opacity: i ? 0.6 : 1 }}>
            {line}
          </p>
        ))}
      </div>
      {playlist.map((item, i) => {
        const tg = tags[i]
        const active = item.id === track.id
        return (
          <Press
            key={item.id}
            label={`${item.title} - ${item.artist}`}
            pressed={active}
            onClick={() => select(item.id)}
            className="absolute font-jp text-ink transition-colors duration-200"
            style={{
              ...box(tg.w, 9),
              left: u(tg.x),
              top: u(tg.y),
              borderRadius: tg.pill ? u(4.5) : u(1.2),
              background: active ? 'var(--color-cream-hi)' : '#ddd7da',
              boxShadow: sh(ring(0.8, 'var(--color-ink)'), bevel(0.8), active && ring(1.8, 'var(--color-rose-hi)')),
              fontSize: u(4),
              fontWeight: active ? 700 : 500,
            }}
          >
            <span className="block truncate" style={{ maxWidth: u(tg.w - 3) }}>
              {item.title.replace(/\s*\(.*\)$/, '')}
            </span>
          </Press>
        )
      })}
    </section>
  )
}
