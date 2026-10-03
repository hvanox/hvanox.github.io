import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { I18nProvider } from './lib/i18n'
import { MotionProvider } from './lib/motion'
import { PlayerProvider } from './lib/player'
import { DialogsProvider } from './lib/dialogs'
import { PlayerDialogProvider } from './components/player/PlayerDialog'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <MotionProvider>
        <PlayerProvider>
          <PlayerDialogProvider>
            <DialogsProvider>
              <App />
            </DialogsProvider>
          </PlayerDialogProvider>
        </PlayerProvider>
      </MotionProvider>
    </I18nProvider>
  </StrictMode>,
)
