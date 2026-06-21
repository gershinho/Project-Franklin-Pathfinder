# Archer UX [1]

Design bundle from [Figma — Archer UX [1]](https://www.figma.com/design/MJtojKgqmnxodW8neWQ7mX/Archer-UX--1-). React + Vite frontend that calls a Supabase Edge Function (`ask`) for search and Q&A.

## Setup

Install dependencies:

```bash
npm i
```

Copy `.env.example` to `.env` and set:

- `VITE_SUPABASE_URL` — project URL (e.g. `https://<project-ref>.supabase.co`; do not include `/rest/v1`)
- `VITE_SUPABASE_ANON_KEY` — anon/public API key from your Supabase project settings

## Development

```bash
npm run dev
```

## Production build

```bash
npm run build
```

Built assets are written to `dist/`.
