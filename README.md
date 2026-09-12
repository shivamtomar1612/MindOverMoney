# Mind Over Money

**Think before you invest.**

Mind Over Money is an educational decision-support platform for first-time investors. It is designed to make financial language, metrics, risk, and market hype easier to understand before a decision is made.

This application is not a brokerage, does not execute trades, and does not promise or guarantee returns.

## Live project

[Open the Mind Over Money project on Vercel](https://vercel.com/mind-over-money/mind-over-money)

## Stack

- Next.js 16 with the App Router
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Lucide React
- Recharts
- Optional Supabase authentication and private persistence with Row Level Security
- Server-side Gemini integration (with OpenAI compatibility and deterministic offline fallbacks)
- Zod request validation for AI routes
- `pdf-parse` for server-side report text extraction

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env.local` when you want to configure Supabase or Gemini. All variables are optional: without them, the app runs fully in Demo Mode with browser-local persistence and deterministic AI explanations.

### Environment variables

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are safe browser configuration values. `GEMINI_API_KEY`, `OPENAI_API_KEY`, and `FINANCIAL_API_KEY` are server-only and must never be exposed to client code. `GEMINI_MODEL` is optional; the default is `gemini-3.6-flash`.

For a production-style local check:

```bash
npm run build
npm run start
```

## Supabase setup

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from your Supabase project. The legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` remains supported as a fallback.
3. Apply `supabase/migrations/20260912000000_initial.sql` in the Supabase SQL editor or with the Supabase CLI.
4. Enable email/password authentication in Supabase Auth.

Only the public URL and anon key are used in the browser. `OPENAI_API_KEY` and `FINANCIAL_API_KEY` remain server-only. If the Supabase client is unavailable, auth and every persistence feature fall back to Demo Mode without blocking the UI.

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run test:data
npm run test:risk
npm run test:hype
npm run test:ai
npm run test:simulator
npm run test:report
npm run test:chatbot
npm run test:portfolio
npm run test:learning
npm run test:supabase
npm run typecheck
npm run build
```

## Current scope

The repository contains the responsive landing page, working desktop and mobile navigation, offline demo data, optional Supabase email/password authentication, private profile/watchlist/analysis/portfolio/learning/report persistence with RLS, asset exploration and filtering, Hype Check attention-vs-fundamentals comparisons, a guided decision-readiness simulator, an AI Financial Explainer with an offline lesson fallback, an AI Financial Report Analyzer with demo mode and PDF extraction, a context-aware Mind Over Money AI chatbot, a calculated asset-analysis experience, a localStorage-backed paper portfolio at `/portfolio`, and a six-category financial-literacy center with lesson pages and a 10-question quiz at `/learn`. Authentication and persistence fall back to Demo Mode when Supabase variables are missing; live market feeds and trade execution remain intentionally out of scope.

## Offline demo data

The demo works without a financial API or internet connection. Typed fixtures live in `src/data`, and application code should access them through `src/lib/data` rather than importing or recreating asset objects inside components.

All market figures are illustrative and carry the notice: **Demo market data — not live.** Report analysis is educational and never makes investment recommendations. PDF uploads are validated as PDF files up to 10 MB, extracted server-side, and use deterministic local analysis whenever OpenAI is unavailable.

## Project structure

```text
src/
  app/                  App Router pages
  components/
    ui/                 shadcn/ui primitives
    layout/             shared navigation and page shells
    dashboard/          dashboard features
    assets/             asset views
    analysis/           analysis features
    risk/               risk-profile features
    hype/               hype-check features
    simulator/          simulation features
    learning/           education features
  lib/
    data/               app-level data helpers
    calculations/       pure financial calculations
    ai/                 OpenAI providers, prompts, and deterministic fallbacks
    supabase/           Supabase configuration and clients
  types/                shared TypeScript types
  data/                 seed and static product data
```

## Routes

`/`, `/dashboard`, `/explore`, `/asset`, `/asset/[symbol]`, `/analyze`, `/hype-check`, `/simulator`, `/portfolio`, `/learn`, `/learn/[term]`, `/learn/quiz`, `/profile`, `/login`, and `/signup`.

## Deployment

Deploy as a standard Next.js application on Vercel or another Node.js host. Set only the environment variables you intend to use, run `npm run build`, and serve with `npm run start`. Demo Mode needs no database or external API.

There are no shared demo credentials. The complete judge flow works without signing in; when Supabase is absent, the login and signup screens use browser-local demo accounts.
