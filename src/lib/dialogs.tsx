import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { Modal } from '../components/ui/Modal'
import { dict } from '../content/dict'
import { experience, stack } from '../content/profile'
import { useI18n } from './i18n'

type Which = 'about' | 'stack' | 'experience'
type DialogsValue = { show: (which: Which, focus?: string) => void }

const DialogsContext = createContext<DialogsValue | null>(null)

export function useDialogs(): DialogsValue {
  const ctx = useContext(DialogsContext)
  if (!ctx) throw new Error('useDialogs must be used inside <DialogsProvider>')
  return ctx
}

/** The three text windows the board opens: about, stack, experience. */
export function DialogsProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n()
  const [open, setOpen] = useState<Which | null>(null)
  const [focus, setFocus] = useState<string | undefined>()
  const value = useMemo<DialogsValue>(
    () => ({
      show: (which, f) => {
        setFocus(f)
        setOpen(which)
      },
    }),
    [],
  )
  const close = () => setOpen(null)
  const closeLabel = t(dict.a11y.close)

  return (
    <DialogsContext.Provider value={value}>
      {children}
      <Modal open={open === 'about'} onClose={close} closeLabel={closeLabel} title={<span className="font-mono">{t(dict.about.title)}</span>}>
        <p className="m-0 font-mono text-sm leading-relaxed text-paper">{t(dict.about.body)}</p>
        <p className="mt-4 mb-0 font-script text-3xl leading-tight text-rose-hi">{t(dict.about.note)}</p>
      </Modal>
      <Modal open={open === 'stack'} onClose={close} closeLabel={closeLabel} title={<span className="font-mono uppercase">{t(dict.stack.title)}</span>}>
        <dl className="m-0 grid gap-3 font-mono text-sm">
          {stack.map((group) => (
            <div key={group.group} className="grid grid-cols-[88px_1fr] gap-3">
              <dt className="font-bold text-rose-hi">{t(dict.stack[group.group])}</dt>
              <dd className="m-0 text-paper">{group.items.join(', ')}</dd>
            </div>
          ))}
        </dl>
      </Modal>
      <Modal open={open === 'experience'} onClose={close} closeLabel={closeLabel} title={<span className="font-mono">{t(dict.experience.title)}</span>}>
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {experience.map((item) => (
            <li key={item.id} className={focus && item.id !== focus ? 'opacity-60' : ''}>
              <p className="m-0 font-sans text-sm font-bold text-paper">{t(item.title)}</p>
              <p className="mt-1 mb-0 font-mono text-sm leading-relaxed text-paper/90">{t(item.body)}</p>
            </li>
          ))}
        </ul>
      </Modal>
    </DialogsContext.Provider>
  )
}
