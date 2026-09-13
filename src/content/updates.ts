/**
 * Лог постройки сайта. Даты настоящие — это записи одного дня работы,
 * 2026-09-13. Ничего не выдумано «для красоты»: каждая строка соответствует
 * реально собранному куску проекта.
 */

export type UpdateEntry = {
  id: string;
  /** ISO-дата, YYYY-MM-DD. */
  date: string;
  body: { ru: string; en: string };
};

export const updates: UpdateEntry[] = [
  {
    id: "scaffold",
    date: "2026-09-13",
    body: {
      ru: "Каркас: Next 16 App Router, статический экспорт в out/, TypeScript strict.",
      en: "Scaffold: Next 16 App Router, static export to out/, TypeScript strict.",
    },
  },
  {
    id: "tokens",
    date: "2026-09-13",
    body: {
      ru: "Токены в globals.css: палитра, четыре шрифта, жёсткие тени, keyframes.",
      en: "Tokens in globals.css: palette, four fonts, hard shadows, keyframes.",
    },
  },
  {
    id: "i18n",
    date: "2026-09-13",
    body: {
      ru: "Двуязычность без роутинга: словарь плюс контекст, выбор языка в localStorage.",
      en: "Bilingual without routing: dictionary plus context, language choice in localStorage.",
    },
  },
  {
    id: "art",
    date: "2026-09-13",
    body: {
      ru: "Алтарь Тето: 26 фанартов через scripts/fetch-art.py, автор подписан под каждым.",
      en: "Teto shrine: 26 fan arts via scripts/fetch-art.py, artist credited under each.",
    },
  },
  {
    id: "chrome",
    date: "2026-09-13",
    body: {
      ru: "Обвязка и секции: окна win98, плеер с визуализатором, счётчик, зигзаг-полосы.",
      en: "Chrome and sections: win98 windows, player with visualizer, counter, zigzag rails.",
    },
  },
];
