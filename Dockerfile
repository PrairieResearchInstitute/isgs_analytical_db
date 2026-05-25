FROM node:22-alpine AS builder

WORKDIR /app

COPY web/package.json web/package-lock.json* ./web/
WORKDIR /app/web
RUN npm ci

COPY web ./
RUN npm run build

RUN npm prune --production


FROM node:22-alpine AS runtime

WORKDIR /app

COPY --from=builder /app/web/build ./build
COPY --from=builder /app/web/node_modules ./node_modules
COPY --from=builder /app/web/package.json ./

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["node", "build/index.js"]