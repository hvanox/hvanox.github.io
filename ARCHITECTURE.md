# hvano.dev — architecture

Портфолио-лендинг Хвано (backend dev). Статический сайт на GitHub Pages.

## Стек

| Слой | Выбор | Почему |
|---|---|---|
| Фреймворк | Next.js 16 App Router, `output: "export"` | GitHub Pages отдаёт только статику |
| Язык | TypeScript strict | |
| Стили | Tailwind CSS v4 (`@theme` в `globals.css`) | токены только оттуда, без хардкода цветов |
| UI-кит | shadcn/ui (Radix + cva) | ставится по мере нужды, не весь |
| Анимация | `motion` (framer-motion v12) | глитчи, marquee, hover |
| Данные | TanStack Query v5 | клиентские виджеты: GitHub-статы |
| Иконки | lucide-react | |

## Хостинг

- Репо: `github.com/hvanox/hvanox.github.io`, ветка `main`.
- CI: `.github/workflows/deploy.yml` -> `pnpm build` -> артефакт `out/` -> `actions/deploy-pages`.
- `public/.nojekyll` обязателен: иначе Pages режет `_next/`.
- Никаких server actions, route handlers, middleware, ISR, `next/image` оптимизации — статический экспорт их не умеет.

## Слои

```
src/app/            маршруты и layout, только композиция секций
src/components/
  sections/         крупные блоки страницы (hero, about, stack, ...)
  chrome/           old-web обвязка: окна, marquee, баннеры, плеер
  ui/               shadcn primitives
src/content/        данные: профиль, стек, ачивки, арты (единственный источник строк)
src/lib/            i18n, утилиты, хуки, api-клиенты
```

Правила:
- Компонент не фетчит сам и не хранит строки: данные приходят из `src/content`, тексты — через `useI18n()`.
- Server Components по умолчанию; `"use client"` только там, где есть состояние, звук или наблюдатели.
- Цвета/шрифты/тени — CSS-переменные из `@theme`. Хардкод `#EB0038` в компоненте = брак.
- Арты Teto: `src/content/art.json` (генерируется `scripts/fetch-art.py`), подпись автора мелким текстом обязательна на каждом арте.

## i18n

Двуязычный (ru/en) без роутинга: словарь `src/content/dict.ts`, контекст `src/lib/i18n.tsx`, выбор в `localStorage`, дефолт — по `navigator.language`. Один HTML, переключатель мгновенный.

Причина: `next-intl` с локальными сегментами на статическом экспорте требует дублирования маршрутов и ломает прямые ссылки на Pages. Для одностраничника контекст дешевле.

## Дизайн

Полный old-web максимализм (Neocities/Web 1.0) + breakcore + Kasane Teto + 90-е.
Подробности и токены — `DESIGN.md`.
