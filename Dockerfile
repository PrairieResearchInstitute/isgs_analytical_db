FROM node:22-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY data ./data

COPY web/package.json web/package-lock.json* ./web/
WORKDIR /app/web
RUN npm ci

COPY web ./
RUN npm run build

# Create schema and seed database
RUN npx drizzle-kit push --force
RUN npx tsx scripts/seed.ts

RUN npm prune --production


FROM node:22-alpine AS runtime

WORKDIR /app

COPY --from=builder /app/web/build ./build
COPY --from=builder /app/web/node_modules ./node_modules
COPY --from=builder /app/web/package.json ./
COPY --from=builder /app/web/dev.db ./dev.db

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["node", "build/index.js"]