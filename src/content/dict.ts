/** Двуязычные строки интерфейса. Компоненты берут текст только отсюда. */

export const locales = ["ru", "en"] as const;
export type Locale = (typeof locales)[number];

export const dict = {
  header: {
    slogan: {
      ru: "серверы, сегфолты и 200 bpm",
      en: "servers, segfaults and 200 bpm",
    },
  },
  about: {
    short: {
      ru: "14 лет, родился 19.11.2011. Компьютеры и всё вокруг них. Вокалоиды, поп, брейккор, найткор.",
      en: "14, born 19.11.2011. Computers and everything around them. Vocaloid, pop, breakcore, nightcore.",
    },
    body: {
      ru: "Привет! Эта вкладка «обо мне». Не знаю, что тут написать, так что коротко о себе: мне 14 лет, родился 19.11.2011. Увлекаюсь компьютерами и всем, что с ними связано. Из музыки нравятся вокалоиды, поп, брейккор, найткор, иногда могу послушать рэп. Ну и всё.",
      en: "Hi! This is the about tab. Not sure what to write here, so briefly about me: I'm 14, born 19.11.2011. Into computers and everything related. Music-wise I like vocaloids, pop, breakcore, nightcore, sometimes I can put on rap. That's about it.",
    },
    note: {
      ru: "этот лендинг слегка вайбкод, потому что я не хочу во фронт, да и лень",
      en: "this landing is slightly vibe-coded, cause I don't wanna do frontend, plus I'm lazy",
    },
    more: { ru: "читать целиком", en: "read all" },
    title: { ru: "обо мне.txt", en: "about_me.txt" },
  },
  profile: {
    age: { ru: "Лет", en: "Age" },
    born: { ru: "Рожд.", en: "Born" },
    status: { ru: "Статус", en: "Status" },
    alive: { ru: "Жив", en: "Alive" },
    listening: { ru: "Слушает", en: "Listening" },
    loading: { ru: "Загрузка", en: "Loading" },
    days: { ru: "дней на Земле", en: "days on Earth" },
  },
  stack: {
    title: { ru: "стек", en: "stack" },
    open: { ru: "весь стек", en: "full stack list" },
    lang: { ru: "языки", en: "lang" },
    data: { ru: "данные", en: "data" },
    infra: { ru: "инфра", en: "infra" },
    auth: { ru: "авториз.", en: "auth" },
    tools: { ru: "тулзы", en: "tools" },
  },
  github: {
    repos: { ru: "репо", en: "repos" },
    followers: { ru: "подписч.", en: "followers" },
    since: { ru: "с", en: "since" },
    open: { ru: "профиль на гитхабе", en: "github profile" },
    unavailable: { ru: "гитхаб недоступен", en: "github unavailable" },
  },
  settings: {
    lang: { ru: "Язык", en: "Language" },
    motion: { ru: "Анимации", en: "Motion" },
    on: { ru: "Вкл", en: "On" },
    off: { ru: "Выкл", en: "Off" },
  },
  achievements: {
    label: { ru: "Достижения", en: "Achievements" },
    prev: { ru: "предыдущее", en: "previous" },
    next: { ru: "следующее", en: "next" },
  },
  system: {
    title: { ru: "Системное сообщение", en: "System Message" },
    ok: { ru: "Ок", en: "Ok" },
    cancel: { ru: "Отмена", en: "Cancel" },
    expand: { ru: "Развернуть", en: "Expand" },
  },
  contact: {
    telegram: { ru: "написать в телеграм", en: "message on telegram" },
    copyEmail: { ru: "скопировать почту", en: "copy email" },
    copied: { ru: "почта скопирована", en: "email copied" },
    github: { ru: "гитхаб", en: "github" },
  },
  experience: {
    prefix: { ru: "Документ:", en: "Document of" },
    title: { ru: "документы опыта", en: "experience documents" },
  },
  shrine: {
    title: { ru: "Виртуальная картина.", en: "Virtual Picture." },
    menu: {
      file: { ru: "Файл", en: "File" },
      action: { ru: "Действие", en: "Action" },
      help: { ru: "Помощь", en: "Help" },
    },
    next: { ru: "Дальше", en: "Next" },
    prev: { ru: "Назад", en: "Prev" },
    open: { ru: "открыть целиком", en: "open full size" },
    random: { ru: "случайный арт", en: "random art" },
    credit: { ru: "арт:", en: "art:" },
    artAlt: { ru: "Фанарт Касане Тето, автор", en: "Kasane Teto fan art by" },
  },
  player: {
    songs: { ru: "Песни", en: "Songs" },
    open: { ru: "открыть плеер", en: "open player" },
    play: { ru: "играть", en: "play" },
    pause: { ru: "пауза", en: "pause" },
    prev: { ru: "предыдущий трек", en: "previous track" },
    next: { ru: "следующий трек", en: "next track" },
    playlist: { ru: "плейлист", en: "playlist" },
    like: { ru: "нравится", en: "like" },
    watch: { ru: "открыть клип на youtube", en: "open video on youtube" },
    progress: { ru: "прогресс трека", en: "track progress" },
    volume: { ru: "громкость", en: "volume" },
    track: { ru: "трек", en: "track" },
    vol: { ru: "громк", en: "vol" },
    unmute: { ru: "включи звук", en: "unmute" },
    unplayable: { ru: "трек не играет", en: "track unavailable" },
    close: { ru: "свернуть плеер", en: "minimize player" },
  },
  clock: {
    label: { ru: "Местное время", en: "Local time" },
    toggle: { ru: "переключить 12/24 часа", en: "toggle 12/24 hours" },
  },
  credit: {
    edit: { ru: "эдит фона", en: "board edit by" },
  },
  a11y: {
    close: { ru: "закрыть", en: "close" },
    rotate: { ru: "поверни телефон горизонтально", en: "turn your phone sideways" },
  },
} as const;
