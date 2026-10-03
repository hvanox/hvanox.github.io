import { ArrowSquareOut, Heart, ListBullets, Pause, Play, SkipBack, SkipForward } from '@phosphor-icons/react'
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { dict } from '../../content/dict'
import { playlist, watchUrl } from '../../content/playlist'
import { useI18n } from '../../lib/i18n'
import { formatTime, usePlayer } from '../../lib/player'
import { Modal } from '../ui/Modal'

type PlayerDialogValue = { open: boolean; setOpen: (open: boolean) => void }

const PlayerDialogContext = createContext<PlayerDialogValue | null>(null)

export function usePlayerDialog(): PlayerDialogValue {
  const ctx = useContext(PlayerDialogContext)
  if (!ctx) throw new Error('usePlayerDialog must be used inside <PlayerDialogProvider>')
  return ctx
}

export function PlayerDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const value = useMemo(() => ({ open, setOpen }), [open])
  return (
    <PlayerDialogContext.Provider value={value}>
      {children}
      <PlayerWindow open={open} onClose={() => setOpen(false)} />
    </PlayerDialogContext.Provider>
  )
}

const iconBtn =
  'grid size-10 cursor-pointer place-items-center border-0 bg-transparent text-paper transition-[background-color,transform] duration-200 hover:bg-ink active:scale-95 disabled:cursor-not-allowed disabled:opacity-40'

function PlayerWindow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n()
  const player = usePlayer()
  const { track, playing, time, duration, availability, muted } = player
  const [showList, setShowList] = useState(false)
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const progress = duration > 0 ? Math.min(1, time / duration) : 0

  return (
    <Modal open={open} onClose={onClose} closeLabel={t(dict.player.close)} title={<span className="font-jp">{track.title}</span>}>
      <div className="flex flex-col gap-4">
        <div className="relative aspect-[27/25] overflow-hidden bg-paper" style={{ boxShadow: '0 0 0 1.5px #7b3e48' }}>
          {showList ? (
            <ol className="absolute inset-0 m-0 flex list-none flex-col gap-1 overflow-y-auto bg-cream p-2">
              {playlist.map((item, i) => {
                const active = item.id === track.id
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      aria-current={active}
                      onClick={() => {
                        player.select(item.id)
                        setShowList(false)
                      }}
                      className={`flex w-full cursor-pointer items-baseline gap-3 border-0 px-3 py-2 text-left transition-colors ${active ? 'bg-maroon text-paper' : 'bg-transparent text-ink hover:bg-cream-hi'}`}
                    >
                      <span className="font-mono text-xs tabular-nums opacity-70">{String(i + 1).padStart(2, '0')}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-jp text-sm font-bold">{item.title}</span>
                        <span className="block truncate font-jp text-xs opacity-80">{item.artist}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          ) : (
            <img src="/board/utau-cover.webp" alt="" width={540} height={500} className="size-full object-cover" />
          )}
        </div>

        <div className="min-w-0 font-jp">
          <p className="m-0 truncate text-base font-bold">{track.title}</p>
          <p className="m-0 truncate text-sm opacity-75">{availability === 'missing' ? t(dict.player.unplayable) : track.artist}</p>
        </div>

        <label className="relative block h-5">
          <span className="sr-only">{t(dict.player.progress)}</span>
          <span aria-hidden className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-ink" />
          <span aria-hidden className="absolute top-1/2 left-0 h-[3px] -translate-y-1/2 bg-paper" style={{ width: `${progress * 100}%` }} />
          <span
            aria-hidden
            className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 bg-paper"
            style={{ left: `${progress * 100}%` }}
          />
          <input
            type="range"
            min={0}
            max={Math.max(1, Math.round(duration))}
            value={Math.round(time)}
            disabled={duration <= 0}
            aria-valuetext={`${formatTime(time)} / ${formatTime(duration)}`}
            onChange={(e) => player.seek(Number(e.target.value))}
            className="absolute inset-0 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />
        </label>
        <div className="-mt-3 flex justify-between font-mono text-xs tabular-nums opacity-80">
          <span>{formatTime(time)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button type="button" className={iconBtn} aria-label={t(dict.player.playlist)} aria-pressed={showList} onClick={() => setShowList((v) => !v)}>
              <ListBullets weight="bold" size={22} />
            </button>
            <button
              type="button"
              className={iconBtn}
              aria-label={t(dict.player.like)}
              aria-pressed={Boolean(liked[track.id])}
              onClick={() => setLiked((prev) => ({ ...prev, [track.id]: !prev[track.id] }))}
            >
              <Heart weight={liked[track.id] ? 'fill' : 'bold'} size={22} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className={iconBtn} aria-label={t(dict.player.prev)} onClick={player.prev}>
              <SkipBack weight="fill" size={20} />
            </button>
            <button
              type="button"
              className={`${iconBtn} size-12 bg-paper text-maroon hover:bg-cream-hi`}
              aria-label={playing ? t(dict.player.pause) : t(dict.player.play)}
              onClick={player.toggle}
              disabled={availability === 'missing'}
            >
              {playing ? <Pause weight="fill" size={24} /> : <Play weight="fill" size={24} />}
            </button>
            <button type="button" className={iconBtn} aria-label={t(dict.player.next)} onClick={player.next}>
              <SkipForward weight="fill" size={20} />
            </button>
          </div>
          <a href={watchUrl(track)} target="_blank" rel="noopener noreferrer" className={iconBtn} aria-label={t(dict.player.watch)}>
            <ArrowSquareOut weight="bold" size={22} />
          </a>
        </div>

        {muted && playing ? (
          <button
            type="button"
            onClick={player.unmute}
            className="cursor-pointer border-0 bg-paper px-4 py-2 font-mono text-xs text-maroon"
          >
            [ {t(dict.player.unmute)} ]
          </button>
        ) : null}
      </div>
    </Modal>
  )
}
