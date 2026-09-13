# Задание: собрать компоненты лендинга

Каркас уже готов. Прочти `ARCHITECTURE.md` и `DESIGN.md` — они авторитетны, отклоняться нельзя.
Прочти `node_modules/next/dist/docs/01-app/` при любом сомнении об API Next 16: это форк с ломающими изменениями, памяти не верь.

## Что уже есть (НЕ переписывать)

- `next.config.ts` — `output: "export"`, `trailingSlash`, `images.unoptimized`.
- `src/app/globals.css` — все токены в `@theme` + keyframes + утилиты. Новые цвета только сюда.
- `src/app/layout.tsx` — шрифты, `QueryProvider`, `I18nProvider`.
- `src/lib/i18n.tsx` — `useI18n()` -> `{ locale, setLocale, toggle, t }`, где `t({ru, en})` возвращает строку.
- `src/lib/query-provider.tsx`, `src/lib/utils.ts` (`cn`).
- `src/content/dict.ts` — все строки UI. `src/content/profile.ts` — profile, stack, achievements, experience.
- `src/content/art.json` — массив `{ src, artist, width, height, ratio }`, 26 фанартов Teto в `public/art/*.webp`.

## Что построить

### `src/components/chrome/`
1. `Win98Window.tsx` — server component. Props: `title: string`, `titleJp?: string`, `children`, `className?`, `tone?: "chrome" | "blood"`. Полоса заголовка, декоративные `_ □ ×` с `aria-hidden`, жёсткая тень `shadow-hard`, border 1px. Это основной контейнер секций.
2. `Marquee.tsx` — client. Props: `items: string[]`, `reverse?`, `speed?`. Дублирует список дважды и катит через `animate-marquee`. Никакого тега `<marquee>`.
3. `GlitchText.tsx` — client. Props: `text: string`, `as?`, `className?`. Три слоя (bone/blood/cyan), `glitch-layer` только при hover или `always`.
4. `Badge8831.tsx` — server. 88×31 пиксельный бейдж: `label: string`, `accent?: "blood" | "cyan" | "acid"`. Шрифт `font-pixel`, текст ужимается под ширину.
5. `TetoArt.tsx` — server. Props: `src`, `artist`, `width`, `height`, `alt`, `className?`. Обычный `<img>` (не `next/image`, экспорт статический), `loading="lazy"`, `decoding="async"`, под картинкой подпись `art: {artist}` — 10px, `text-bone-dim`, обязательна.
6. `ScanlineOverlay.tsx` — server. `fixed inset-0 pointer-events-none z-50`, класс `scanlines-layer`, `mix-blend-mode: overlay`, `opacity-40`.
7. `Player.tsx` — client, Winamp-подобный. Ищет `/audio/track.mp3`; если файла нет (fetch HEAD не ок или ошибка `<audio>`) — показывает `dict.player.silence` и глушит кнопки как `disabled`. НИКАКОГО autoplay. Визуализатор: `<canvas>` + WebAudio `AnalyserNode`, рисует бары `--color-blood`, запускается только при воспроизведении; при `prefers-reduced-motion` вместо анимации статичная полоса. Кнопки с `aria-label` из словаря.
8. `VisitCounter.tsx` — client. Счётчик визитов в стиле 2000-х. Сервера нет, поэтому — локальный: `localStorage`, монотонно растёт, стартует со случайного основания, зафиксированного при первом визите. Внизу под цифрами мелким `font-pixel`. Не притворяйся, что это глобальный счётчик: подпиши как локальный в `title`/`aria-label`.
9. `ZigzagRail.tsx` — server. Вертикальные красные зигзаг-полосы по левому и правому краю viewport (мотив багета Teto с официального сайта). Чистый inline SVG с `feTurbulence`-шумом не обязателен — достаточно повторяющегося path. `aria-hidden`.

### `src/components/sections/`
Каждая — обёрнута в `Win98Window`, заголовок из `dict.sections`.
- `Header.tsx` (client) — логотип `HVANO` через `GlitchText` крупно, рядом `重音テト` шрифтом `font-jp`, слоган, `VisitCounter`, переключатель языка (кнопка `ru / en`, активный — `text-blood`). Плюс skip-link на `#main` из `dict.a11y.skipToContent`.
- `SideNav.tsx` (client) — вертикальное меню-якоря по `dict.nav` на секции (`#about`, `#stack`, ...), стиль красного меню из референса: список без отступов, hover — инверсия фона в `--color-blood`.
- `UpdatesLog.tsx` (server) — «updates» лог. Даты брать НЕ выдуманные: прими массив записей пропсом со значениями из `src/content/updates.ts` — создай этот файл с 4-5 реальными записями о постройке сайта (дата 2026-09-13, что сделано, двуязычно).
- `About.tsx` — текст из `dict.about.body`, дисклеймер `dict.about.disclaimer` мелким, рядом один портретный арт Teto через `TetoArt`.
- `Stack.tsx` — группы из `stack` (`profile.ts`), заголовки групп из `dict.stackGroups`, каждый пункт — `Badge8831`. Сетка, плотно.
- `Achievements.tsx` — по одной `Win98Window` (tone blood) на ачивку: год, название, результат, note. Ссылок НЕТ — так просил Хвано.
- `Experience.tsx` — три блока из `experience`.
- `Shrine.tsx` (client) — галерея фанартов: masonry-подобная сетка (CSS columns), все 26 артов из `art.json`, каждый через `TetoArt`, вступление `dict.shrine.intro`. Клик по арту — раскрыть в модалке (Radix Dialog из shadcn, добавь через `pnpm dlx shadcn@latest add dialog`); в модалке тоже подпись автора.
- `GithubStats.tsx` (client) — TanStack Query к `https://api.github.com/users/hvanox` (публичный, без токена): публичные репы, подписчики, дата регистрации. `isPending` -> скелет, `isError` -> честная строка «недоступно», не выдумывай числа.
- `Status.tsx` (client) — блок online/mood/listening из `dict.status`, точка `--color-acid` с `animate-blink`.
- `Guestbook.tsx` — заглушка с `dict.guestbook.stub` + ссылка на телеграм.
- `Contact.tsx` (client) — терминальный вид: `telegram`, `email`, `github` из `profile.contacts`, кнопка «скопировать» с состоянием `copied` (`navigator.clipboard`), `dict.contact.hint`.
- `Webring.tsx` (server) — ряд `Badge8831` с технологиями стека вместо чужих сайтов.
- `Footer.tsx` — `© hvano 2026`, `dict.footer.built` + стек, `dict.footer.construction`.

### `src/app/page.tsx`
Собирает трёхколоночную раскладку строго по схеме из `DESIGN.md`:
верхний `Marquee` -> `Header` -> grid `[240px_1fr_240px]` (`lg:`, ниже — один столбец) -> `Footer`.
Левая колонка: `Player`, `SideNav`, `UpdatesLog`, `Webring`.
Центр (`<main id="main">`): `About`, `Stack`, `Achievements`, `Experience`, `Contact`.
Правая: `Status`, `GithubStats`, `Shrine`, `Guestbook`.
Плюс `ScanlineOverlay` и `ZigzagRail` поверх. Несколько артов Teto «выступают» из сетки (absolute, `pointer-events-none`, ломают прямоугольник) — но не перекрывают текст и не мешают клику.

## Жёсткие правила

- Цвета/шрифты/тени — ТОЛЬКО токены из `@theme` (`text-bone`, `bg-void-deep`, `border-blood`, `font-pixel`, `shadow-hard`). Ни одного hex в `.tsx`.
- Ни одной строки текста в компоненте: всё через `t(...)` из `dict.ts` либо из `profile.ts`. Технические лейблы (`_ □ ×`, `ru`, `en`, названия технологий) — исключение.
- Server Components по умолчанию. `"use client"` только где реально нужны состояние/эффекты/звук.
- Контраст ≥ 4.5:1 для текста. `--color-blood` как текст — только на `--color-void-deep` и кеглем ≥ 18px.
- `prefers-reduced-motion` обязан глушить движение (в CSS уже есть глобальное правило; в JS-анимациях проверяй матч-медиа сам).
- Все интерактивные элементы — настоящие `<button>`/`<a>` с доступным именем.
- Никакого `output: standalone`, server actions, route handlers, `next/image` с оптимизацией — статический экспорт.
- Не удаляй блок `nextjs-agent-rules` в `AGENTS.md`.

## Проверка перед отчётом (обязательна)

```
pnpm lint
pnpm build
```

`pnpm build` должен пройти и создать `out/index.html`. Прогони, покажи вывод. Если ошибки — исправь и прогони снова.
