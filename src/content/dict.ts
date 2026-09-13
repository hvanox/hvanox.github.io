/** Двуязычные строки интерфейса. Компоненты берут текст только отсюда. */

export const locales = ["ru", "en"] as const;
export type Locale = (typeof locales)[number];

export const dict = {
  nav: {
    about: { ru: "обо мне", en: "about" },
    stack: { ru: "стек", en: "stack" },
    achievements: { ru: "ачивки", en: "achievements" },
    experience: { ru: "опыт", en: "experience" },
    shrine: { ru: "алтарь тето", en: "teto shrine" },
    contact: { ru: "контакты", en: "contact" },
  },
  header: {
    slogan: {
      ru: "серверы, сегфолты и 200 bpm",
      en: "servers, segfaults and 200 bpm",
    },
    visits: { ru: "визитов", en: "visits" },
    lang: { ru: "язык", en: "lang" },
    /** Счётчик локальный: сервера нет, глобальные визиты считать нечем. */
    visitsLocal: {
      ru: "Локальный счётчик визитов: считает только этот браузер, не весь сайт.",
      en: "Local visit counter: counts this browser only, not the whole site.",
    },
  },
  sections: {
    welcome: { ru: "добро пожаловать", en: "welcome" },
    about: { ru: "обо мне", en: "about me" },
    stack: { ru: "чем работаю", en: "what i work with" },
    achievements: { ru: "достижения", en: "achievements" },
    experience: { ru: "опыт", en: "experience" },
    shrine: { ru: "алтарь тето", en: "teto shrine" },
    contact: { ru: "связаться", en: "get in touch" },
    updates: { ru: "обновления", en: "updates" },
    status: { ru: "статус", en: "status" },
    nowPlaying: { ru: "сейчас играет", en: "now playing" },
    guestbook: { ru: "гостевая", en: "guestbook" },
    webring: { ru: "кольцо", en: "webring" },
    nav: { ru: "навигация", en: "navigation" },
    github: { ru: "гитхаб", en: "github" },
  },
  stackGroups: {
    lang: { ru: "языки", en: "languages" },
    data: { ru: "данные", en: "data" },
    infra: { ru: "инфраструктура", en: "infrastructure" },
    auth: { ru: "аутентификация", en: "auth" },
    tools: { ru: "инструменты", en: "tools" },
  },
  about: {
    body: {
      ru: "Бэкенд-разработчик. Пришёл через embedded и C, остался в серверах: очереди, схемы данных, авторизация, деплой. Учился сам, проверяю себя контестами и хакатонами. Слушаю breakcore, поэтому сайт выглядит так, как выглядит.",
      en: "Backend developer. Came in through embedded and C, stayed in servers: queues, data schemas, auth, deploys. Self-taught, verified by contests and hackathons. I listen to breakcore, hence the way this site looks.",
    },
    disclaimer: {
      ru: "Страница собрана вручную. Не шаблон. Лучше смотреть на широком экране.",
      en: "Hand-built page. Not a template. Best on a wide screen.",
    },
  },
  shrine: {
    intro: {
      ru: "Касане Тето — UTAU-персонаж, потом Synthesizer V. Всё ниже — фанарты, автор подписан под каждым.",
      en: "Kasane Teto — a UTAU character, later Synthesizer V. Everything below is fan art, artist credited under each.",
    },
    credit: { ru: "арт:", en: "art:" },
    /** Осмысленный alt: перед именем автора подставляется в TetoArt/Shrine. */
    artAlt: {
      ru: "Фанарт Касане Тето, автор",
      en: "Kasane Teto fan art by",
    },
    open: { ru: "Открыть арт целиком, автор", en: "Open full art by" },
  },
  status: {
    online: { ru: "в сети", en: "online" },
    mood: { ru: "настроение", en: "mood" },
    moodValue: { ru: "компилируется", en: "compiling" },
    listening: { ru: "слушаю", en: "listening to" },
    listeningValue: { ru: "breakcore", en: "breakcore" },
  },
  contact: {
    hint: {
      ru: "Пишите в телеграм — отвечаю быстрее всего там.",
      en: "Telegram is the fastest way to reach me.",
    },
    copy: { ru: "скопировать", en: "copy" },
    copied: { ru: "скопировано", en: "copied" },
  },
  guestbook: {
    stub: {
      ru: "Гостевая книга требует сервер, а сайт статический. Пока — телеграм.",
      en: "A guestbook needs a server and this site is static. Telegram for now.",
    },
  },
  player: {
    play: { ru: "играть", en: "play" },
    pause: { ru: "пауза", en: "pause" },
    stop: { ru: "стоп", en: "stop" },
    silence: { ru: "трек не загружен", en: "no track loaded" },
  },
  github: {
    repos: { ru: "публичных репо", en: "public repos" },
    followers: { ru: "подписчиков", en: "followers" },
    joined: { ru: "на гитхабе с", en: "on github since" },
    unavailable: {
      ru: "Статистика GitHub недоступна.",
      en: "GitHub stats unavailable.",
    },
  },
  footer: {
    built: { ru: "собрано на", en: "built with" },
    construction: { ru: "вечно в разработке", en: "eternally under construction" },
  },
  a11y: {
    reduceMotion: {
      ru: "Анимации отключены системной настройкой.",
      en: "Animations disabled by your system setting.",
    },
    skipToContent: { ru: "к содержимому", en: "skip to content" },
    close: { ru: "закрыть", en: "close" },
  },
} as const;
