# The Fitting Bench

A fly-rod and setup fitting advisor. Structured intake, then a live conversational
recommendation from Claude with web search on. Anyone can use the deployed URL; they do
not need their own AI access, because your API key lives server-side.

> Status: working prototype. Live-search only (no product catalogue yet). Visual design is
> a placeholder pending a chosen direction. The behavioural logic lives in the system
> prompt inside `api/fit.js`.

## What is where

- `src/App.jsx` - front-end: the intake form and chat. Calls `/api/fit`, never the
  Anthropic API directly, so no key is ever in the browser.
- `api/fit.js` - the serverless function. Holds the key, holds the **system prompt**, calls
  the Messages API with the web search tool. Edit the prompt and the axis/budget rules here.
- The model string is in `api/fit.js` (`claude-sonnet-4-6`). Swap for `claude-opus-4-8`
  for maximum quality. Verify current model strings at https://docs.claude.com .

## Run locally

The front-end and the serverless function need to run together, so use the Vercel CLI
rather than plain `vite dev` (plain Vite will not serve `/api/fit`).

```bash
npm install
npm i -g vercel          # if you do not have it
vercel dev               # serves the app AND the function at localhost:3000
```

Set your key for local dev (do not commit it):

```bash
# create .env.local  (already gitignored)
ANTHROPIC_API_KEY=sk-ant-...
```

## Deploy (Vercel, least friction)

1. Push this folder to a GitHub repo.
2. In Vercel: New Project, import the repo. It auto-detects Vite + the `api/` function.
3. Project Settings > Environment Variables: add `ANTHROPIC_API_KEY`.
4. Deploy. You get a URL. Share it with anyone.

Cloudflare Pages + a Worker is the cheaper-at-scale equivalent if you prefer; the function
logic ports across with minor changes to the handler signature.

## Before you share the link widely (cost collar)

Every run spends your tokens plus web search. Add protection:

- A hard `max_tokens` is already set (4096) and the conversation is capped to the last 12
  messages in `api/fit.js`.
- Real per-user rate limiting needs a store (serverless functions are stateless between
  calls). Add Vercel KV or Upstash Redis and a simple per-IP daily cap in `api/fit.js`.
  Until then, treat the link as semi-private.

## Known limitations (by design, for now)

- **Popularity bias.** With live search only, the shortlist leans toward whatever ranks
  highest (often the big retail names). The prompt pushes back, but the real fix is a
  curated product catalogue and source-confidence table. That is the planned next build.
- **Price/stock are indicative.** Live extraction off retail pages is imperfect; the app
  says so and points the user to a shopping search.
- **Not tested end to end in this environment.** Install, add your key, run `vercel dev`,
  and expect a small debugging pass on first run.
