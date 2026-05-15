# IDOT Wetlands Data — Web App

SvelteKit app for managing wetlands data collection. Uses SQLite (`dev.db`) via Drizzle ORM for local development.

## Running

```bash
npm run dev          # http://localhost:5173
npm run db:studio    # Drizzle Studio to inspect/add data
npm run db:push      # Apply schema changes after editing schema.ts
```

## Project structure

```
src/
  app.html                    # HTML shell
  app.css                     # Tailwind v4 import
  lib/server/
    db.ts                     # SQLite + Drizzle singleton
    schema.ts                 # Database schema (edit this to add tables/columns)
  routes/
    +layout.svelte            # App shell with header
    +page.server.ts           # Loads sites from DB
    +page.svelte              # Sites table UI
drizzle.config.ts             # Points to dev.db
drizzle/                      # Generated migration snapshots
dev.db                        # SQLite file (gitignored)
```

## Updating the schema

1. Edit `src/lib/server/schema.ts`
2. Run `npm run db:push` to apply changes to `dev.db`
3. Use `npm run db:studio` to inspect the database
