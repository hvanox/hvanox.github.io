import { X } from '@phosphor-icons/react'
import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Board-styled window on a native <dialog>: focus trap, Esc and backdrop
 * come from the platform. Title bar is cream with a bevel, body is maroon.
 */
export function Modal({
  open,
  onClose,
  title,
  closeLabel,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  closeLabel: string
  children: ReactNode
  wide?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="modal"
      style={wide ? { maxWidth: 'min(94vw, 760px)' } : undefined}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div style={{ boxShadow: '0 0 0 2px var(--color-paper), 0 18px 50px rgb(63 26 32 / 0.55)' }}>
        <div
          className="flex items-center justify-between gap-3 bg-cream px-3 py-1.5 text-ink"
          style={{ boxShadow: 'inset 2px 2px 0 var(--color-paper), inset -2px -2px 0 var(--color-shade)' }}
        >
          <h2 className="m-0 truncate font-sans text-[15px] font-normal">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="grid size-6 shrink-0 cursor-pointer place-items-center border-0 bg-ink text-paper transition-colors hover:bg-rose"
            style={{ boxShadow: 'inset 0 0 0 1.5px var(--color-paper), inset 0 0 0 3px var(--color-ink)' }}
          >
            <X weight="bold" size={14} />
          </button>
        </div>
        <div
          className="bg-maroon p-5"
          style={{ boxShadow: 'inset 0 0 0 5px var(--color-maroon), inset 0 0 0 6.5px #7b3e48' }}
        >
          {children}
        </div>
      </div>
    </dialog>
  )
}
