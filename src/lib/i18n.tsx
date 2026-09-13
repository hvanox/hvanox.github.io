"use client";

/**
 * Двуязычность без роутинга: статический экспорт отдаёт один HTML,
 * язык живёт в контексте + localStorage. Дефолт берём из navigator.language.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { locales, type Locale } from "@/content/dict";

const STORAGE_KEY = "hvano.locale";
const DEFAULT_LOCALE: Locale = "en";

/** Пара переводов, которую хранят словари и контент. */
export type Localized = { readonly ru: string; readonly en: string };

type I18nValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  toggle: () => void;
  /** Достаёт нужную сторону из пары переводов. */
  t: (value: Localized) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return value !== null && (locales as readonly string[]).includes(value);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Читаем предпочтение после гидрации: на сервере navigator недоступен,
  // а рассинхрон разметки ломал бы гидрацию.
  // Синхронный setState здесь намеренный — подтягиваем внешнее состояние.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(stored);
      return;
    }
    const browser = navigator.language.slice(0, 2).toLowerCase();
    setLocaleState(browser === "ru" ? "ru" : DEFAULT_LOCALE);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      toggle: () => setLocale(locale === "ru" ? "en" : "ru"),
      t: (pair: Localized) => pair[locale],
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
