# Project Franklin Pathfinder

Design bundle from [Figma — Archer UX [1]](https://www.figma.com/design/MJtojKgqmnxodW8neWQ7mX/Archer-UX--1-). React + Vite frontend backed by Supabase for authentication, chat history, and a vector-search Q&A Edge Function (`ask`).

## Features

- **Authentication**: Sign in, sign up, or continue as a guest (Supabase anonymous auth). Unauthenticated users see a landing page; signed-in users enter the main app.
- **Archer Pathfinder**: Chat and search interface with an auto-expanding input, typed assistant responses, and formatted answers (markdown links, bold, code). Queries call the Supabase `ask` Edge Function for RAG-based answers with sources and framework references.
- **Chat history**: Conversations and messages persist in Supabase. The sidebar lists recent chats, supports resuming and deleting threads, and refreshes after each exchange.
- **Roadmap dashboard**: Interactive data table with collapsible tier levels (L1, L2, L3) and a dynamic current-phase tracker.
- **Polished UI/UX**: Semi-transparent dot-grid background, smooth micro-animations, and responsive layouts.

## Setup

Install dependencies:

```bash
npm i
```

Copy `.env.example` to `.env` and set:

- `VITE_SUPABASE_URL` — project URL (e.g. `https://<project-ref>.supabase.co`; do not include `/rest/v1`)
- `VITE_SUPABASE_ANON_KEY` — anon/public API key from your Supabase project settings

### Supabase backend

The frontend expects a configured Supabase project with:

- **Auth** — Email/password sign-up enabled; anonymous sign-in enabled for guest mode.
- **Edge Function** — `ask` deployed and callable from the client (accepts `{ query: string }`, returns `{ answer, sources?, classified?, ... }`).
- **Database** — `conversations` and `messages` tables with row-level security scoped to `auth.uid()`. Assistant message metadata (sources, classification, etc.) is stored as JSON on `messages.metadata`.

The `document_chunks` table and ingest/classify Edge Functions power the backend search pipeline but are not used directly by this frontend.

## Development

```bash
npm run dev
```

## Production build

```bash
npm run build
```

Built assets are written to `dist/`.

## Project structure

```
src/
├── app/
│   ├── App.tsx              # Shell: sidebar, auth gate, view routing
│   └── components/
│       ├── LandingPage.tsx  # Sign in / sign up / guest
│       ├── PathfinderChat.tsx
│       ├── Roadmap.tsx
│       └── FormattedAnswer.tsx
├── lib/
│   ├── AuthProvider.tsx     # Supabase auth context
│   ├── ask.ts               # ask Edge Function client
│   ├── conversations.ts     # Chat persistence
│   └── supabaseClient.ts
└── main.tsx
```
