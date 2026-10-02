# hvano.dev

**Live:** https://hvanox.github.io

Сайт — это эдит Kasane Teto от **reathaa**: картинка служит фоном, а поверх
каждой её панели лежат живые данные и кнопки (координаты — пиксели исходника
736×414, проп `box` у оверлея). На портретном экране борд держит высоту
экрана и листается вбок.

Старая версия сайта (win98 / брейккор) лежит в `portfolio/` как архив и в сборку не входит.

## Стек

Next.js 16 (App Router, static export) · TypeScript · Tailwind CSS v4 · shadcn/ui · TanStack Query v5 · YouTube iframe API

## Разработка

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm lint
pnpm build        # статика в out/
```

## Где что

- `src/content/` — все тексты и данные (профиль, словарь ru/en, плейлист, арты, лог обновлений).
- `src/components/overlays/` — оверлеи поверх панелей, `src/components/board/` — примитивы.
- `src/lib/player.tsx` — плеер поверх официальных клипов на YouTube (просмотры идут авторам).
- `scripts/clean-board.py` — вытирает зашитый текст с эдита и кладёт фон в `public/board/`.

Автор каждого фанарта подписан под изображением на сайте.
