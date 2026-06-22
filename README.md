1# Project Franklin Pathfinder

Design bundle from [Figma — Archer UX [1]](https://www.figma.com/design/MJtojKgqmnxodW8neWQ7mX/Archer-UX--1-). React + Vite frontend that calls a Supabase Edge Function (`ask`) for search and Q&A.

## Features

- **Interactive Sidebar Navigation**: Smooth, collapsible sidebar containing quick links to the main application modules and recent chat history.
- **Archer Pathfinder**: The core chat and search interface. Features an auto-expanding search bar for snappier query entry and integrates directly with the Supabase Edge Function.
- **Roadmap Dashboard**: A sophisticated, interactive data table providing a structured breakdown of project phases. Features include collapsible tier levels (L1, L2, L3) and a dynamic current-phase tracker.
- **Polished UI/UX**: Designed with a sleek, premium aesthetic—including a clean semi-transparent dot-grid background, smooth micro-animations, and responsive layouts.

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
