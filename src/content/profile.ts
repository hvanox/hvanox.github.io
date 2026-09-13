/** Единственный источник данных о профиле. Компоненты не хардкодят строки. */

export const profile = {
  handle: "hvano",
  role: { ru: "backend-разработчик", en: "backend developer" },
  tetoName: "重音テト",
  location: { ru: "Каракол, Кыргызстан", en: "Karakol, Kyrgyzstan" },
  tagline: {
    ru: "пишу серверы, ломаю ритм",
    en: "i write servers, i break the beat",
  },
  contacts: {
    telegram: { label: "@h1yoto", href: "https://t.me/h1yoto" },
    email: { label: "hvano@protonmail.com", href: "mailto:hvano@protonmail.com" },
    github: { label: "github.com/hvanox", href: "https://github.com/hvanox" },
  },
} as const;

export type StackGroupId = "lang" | "data" | "infra" | "auth" | "tools";

export const stack: { group: StackGroupId; items: string[] }[] = [
  { group: "lang", items: ["Python", "C", "C++", "Bash", "SQL"] },
  { group: "data", items: ["PostgreSQL", "Redis", "SQLite", "ORM"] },
  { group: "infra", items: ["Linux", "Docker", "Nginx", "Cloudflare"] },
  { group: "auth", items: ["JWT", "OAuth2"] },
  { group: "tools", items: ["Git", "Postman"] },
];

/** Ачивки. Ссылок нет намеренно — Хвано просил без них. */
export const achievements = [
  {
    id: "nasa",
    year: "2025",
    title: { ru: "NASA Space Apps Challenge", en: "NASA Space Apps Challenge" },
    result: { ru: "Global Nominee", en: "Global Nominee" },
    note: {
      ru: "Работа вышла из локального этапа в глобальную номинацию.",
      en: "Project advanced from the local stage to global nomination.",
    },
  },
  {
    id: "prod",
    year: "2025",
    title: { ru: "PROD", en: "PROD" },
    result: { ru: "Финал", en: "Finalist" },
    note: {
      ru: "Финал командной олимпиады по разработке продуктов.",
      en: "Final stage of the product-development team olympiad.",
    },
  },
  {
    id: "hacktivizm",
    year: "2025",
    title: { ru: "Hacktivizm", en: "Hacktivizm" },
    result: { ru: "Призёр", en: "Prizewinner" },
    note: { ru: "Хакатон, призовое место.", en: "Hackathon, prize placement." },
  },
] as const;

export const experience = [
  {
    id: "embedded",
    title: { ru: "Embedded, самоучка", en: "Embedded, self-taught" },
    body: {
      ru: "Микроконтроллеры и железо с нуля: C, работа с памятью, периферия, отладка без комфорта высокоуровневых абстракций.",
      en: "Microcontrollers and hardware from scratch: C, manual memory work, peripherals, debugging without high-level comforts.",
    },
  },
  {
    id: "bots",
    title: { ru: "Telegram-боты", en: "Telegram bots" },
    body: {
      ru: "Боты и бэкенды к ним: асинхронный Python, очереди, Redis под состояние, Postgres под данные, деплой в Docker за Nginx.",
      en: "Bots and their backends: async Python, queues, Redis for state, Postgres for data, Docker deploys behind Nginx.",
    },
  },
  {
    id: "cp",
    title: { ru: "Спортивное программирование", en: "Competitive programming" },
    body: {
      ru: "Алгоритмы и структуры данных под таймером. Отсюда привычка считать сложность до того, как запускать.",
      en: "Algorithms and data structures under a clock. Where the habit of counting complexity before running came from.",
    },
  },
] as const;
