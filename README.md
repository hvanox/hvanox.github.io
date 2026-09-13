# hvano.dev

Портфолио-лендинг. Backend dev, breakcore, Kasane Teto.

**Live:** https://hvanox.github.io

## Стек

Next.js 16 (App Router, static export) · TypeScript · Tailwind CSS v4 · shadcn/ui · TanStack Query v5 · motion

## Разработка

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm lint
pnpm build        # статика в out/
```

Фанарты Teto подтягиваются скриптом (danbooru, rating:general, один арт на художника, конверт в webp):

```bash
python3 scripts/fetch-art.py
cd public/art && for f in *.jpg *.png; do cwebp -q 82 -resize 900 0 "$f" -o "${f%.*}.webp"; done && rm -f *.jpg *.png
```

Автор каждого арта подписан под изображением на сайте.

## Деплой

Пуш в `main` -> GitHub Actions собирает `out/` и публикует на Pages. Настройки репозитория: Settings -> Pages -> Source = GitHub Actions.

## Документы

- `ARCHITECTURE.md` — слои, стек, правила
- `DESIGN.md` — палитра, типографика, раскладка, доступность
