# IDOT Wetlands Data — Web App

SvelteKit app for managing wetlands data collection. Uses PostgreSQL via Drizzle ORM.

## Quick start (Docker)

```bash
docker compose up --build
```

This builds both images, starts PostgreSQL, runs the seed job (schema push + data load), then starts the web app at http://localhost:3000.

PostgreSQL is exposed on the host at `localhost:5432` so you can connect with any client:

```
postgresql://idot:idot@localhost:5432/idot
```

If port 5432 is already in use, override it:

```bash
POSTGRES_HOST_PORT=5499 docker compose up --build
```

To re-seed without rebuilding (seed is idempotent):

```bash
docker compose run --rm seed
```

## Local development against the Docker database

Start just the database, then run the SvelteKit dev server on the host:

```bash
docker compose up postgres -d

cd web
DATABASE_URL=postgresql://idot:idot@localhost:5432/idot npm run dev   # http://localhost:5173
```

Add the URL to `web/.env` (gitignored) to avoid typing it every time:

```
DATABASE_URL=postgresql://idot:idot@localhost:5432/idot
```

Then the standard dev commands work without any prefix:

```bash
npm run dev          # http://localhost:5173
npm run db:studio    # Drizzle Studio connected to the Docker postgres
npm run db:push      # Apply schema changes after editing schema.ts
```

## Project structure

```
docker-compose.yml            # postgres + seed + web services
data/                         # NDJSON seed files
web/
  src/
    app.html                  # HTML shell
    app.css                   # Tailwind v4 import
    lib/server/
      db.ts                   # Drizzle + postgres-js singleton (reads DATABASE_URL)
      schema.ts               # Database schema (edit this to add tables/columns)
    routes/
      +layout.svelte          # App shell with header
      +page.server.ts         # Loads projects from DB
      +page.svelte            # Projects table UI
  scripts/
    seed.ts                   # Loads data/ files into postgres
  drizzle.config.ts           # Points to DATABASE_URL
```

## Pre-commit hooks

Pre-commit hooks run automatically on every `git commit` via [husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/lint-staged/lint-staged).

**What runs on each commit:**
- **Prettier** — auto-formats staged `.ts`, `.js`, `.svelte`, `.css`, `.json`, and `.md` files in place
- **ESLint** — auto-fixes staged `.ts`, `.js`, and `.svelte` files; fails the commit if non-fixable errors remain
- **svelte-check** — full TypeScript type check across all files; fails the commit on type errors

Hooks are initialized automatically when you run `npm install` (via the `prepare` script). To skip hooks in an emergency: `git commit --no-verify`.

To run the checks manually without committing:

```bash
npm run lint     # prettier + eslint check
npm run check    # svelte-check (TypeScript)
npm run format   # auto-format everything
```

## Updating the schema

1. Edit `web/src/lib/server/schema.ts`
2. Run `npm run db:push` to apply changes to the database
3. Use `npm run db:studio` to inspect the database

## AI development with Claude Code

This project uses the [Svelte Claude plugin](https://svelte.dev/docs/ai/claude-plugin) for accurate Svelte 5 code generation. The plugin connects Claude Code to a remote MCP server with up-to-date Svelte documentation, a specialized Svelte file editor agent, and auto-fix tooling.

### Setup (one time)

In Claude Code, run:

```
/plugin marketplace add sveltejs/ai-tools
/plugin install svelte
```

### How it works

Once installed, Claude Code has access to three MCP tools:

- **`list-sections`** — lists all available Svelte 5 / SvelteKit documentation sections
- **`get-documentation`** — fetches full documentation for specific sections
- **`svelte-autofixer`** — analyzes Svelte components and returns issues/suggestions

### Tips

- When creating or editing `.svelte`, `.svelte.ts`, or `.svelte.js` files, Claude will automatically use the plugin to validate code before returning it.
- For Svelte-specific tasks, the plugin routes work through a dedicated agent (`svelte:svelte-file-editor`) that keeps Svelte concerns out of the main context window, reducing token usage.
- If you see the autofixer report issues, Claude will keep iterating until it returns clean.
