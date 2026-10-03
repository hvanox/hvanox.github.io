
/**
 * Переключатель анимаций (тумблер на панели настроек). Дефолт — системный
 * prefers-reduced-motion, выбор пользователя живёт в localStorage.
 * Состояние отражается в <html data-motion="off">, CSS гасит движение сам.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "hvano.motion";

type MotionValue = { motion: boolean; setMotion: (next: boolean) => void };

const MotionContext = createContext<MotionValue | null>(null);

export function MotionProvider({ children }: { children: ReactNode }) {
  const [motion, setMotionState] = useState(true);

  // Синхронный setState намеренный — подтягиваем внешнее состояние после гидрации.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }
    if (stored === "on" || stored === "off") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMotionState(stored === "on");
      return;
    }
    setMotionState(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = motion ? "on" : "off";
  }, [motion]);

  const setMotion = useCallback((next: boolean) => {
    setMotionState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {
      // приватный режим: просто не запоминаем
    }
  }, []);

  const value = useMemo(() => ({ motion, setMotion }), [motion, setMotion]);
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotion(): MotionValue {
  const ctx = useContext(MotionContext);
  if (!ctx) throw new Error("useMotion must be used inside <MotionProvider>");
  return ctx;
}
