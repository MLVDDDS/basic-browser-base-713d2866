# Frontend Standalone

Это выделенная фронтенд-часть проекта для отдельного репозитория.

## Что внутри

- React + Vite + TypeScript
- Tailwind + shadcn/ui
- Весь исходный фронтенд-код из `src/`
- Статика из `public/`

## Быстрый старт

```bash
npm install
cp .env.example .env
npm run dev
```

Фронт поднимется на `http://localhost:8899`.

## Прод-сборка

```bash
npm run build
npm run preview
```

## Переменные окружения

Смотри `.env.example`.
Минимально обычно нужны:

- `VITE_API_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_GOOGLE_CLIENT_ID` (если используешь Google login)
