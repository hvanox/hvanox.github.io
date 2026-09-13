/** Двуязычные строки интерфейса. Компоненты берут текст только отсюда. */

export const locales = ["ru", "en"] as const;
export type Locale = (typeof locales)[number];

export const dict = {
  nav: {
    about: { ru: "обо мне", en: "about" },
    stack: { ru: "стек", en: "stack" },
    achievements: { ru: "ачивки", en: "achievements" },
    experience: { ru: "опыт", en: "experience" },
    contact: { ru: "контакты", en: "contact" },
  },
  header: {
    slogan: {
      ru: "серверы, сегфолты и 200 bpm",
      en: "servers, segfaults and 200 bpm",
    },
    lang: { ru: "язык", en: "lang" },
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
      ru: "Привет! Эта вкладка «обо мне». Не знаю, что тут написать, так что коротко о себе: мне 14 лет, родился 19.11.2011. Увлекаюсь компьютерами и всем, что с ними связано. Из музыки нравятся вокалоиды, поп, брейккор, найткор, иногда могу послушать рэп. Ну и всё.",
      en: "Hi! This is the about tab. Not sure what to write here, so briefly about me: I'm 14, born 19.11.2011. Into computers and everything related. Music-wise I like vocaloids, pop, breakcore, nightcore, sometimes I can put on rap. That's about it.",
    },
    note: {
      ru: "этот лендинг слегка вайбкод, потому что я не хочу во фронт, да и лень",
      en: "this landing is slightly vibe-coded, cause I don't wanna do frontend, plus I'm lazy",
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
    trackUnplayable: { ru: "трек не играет", en: "track unavailable" },
    tracklist: { ru: "плейлист", en: "playlist" },
    lyrics: { ru: "текст песни", en: "lyrics" },
    watchOnYoutube: { ru: "смотреть на youtube", en: "watch on youtube" },
    unmute: { ru: "включи звук", en: "unmute" },
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
