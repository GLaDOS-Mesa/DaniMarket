FROM node:22-slim AS build

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/.output .output
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/prisma prisma
COPY --from=build /app/prisma.config.ts .
COPY --from=build /app/package.json .

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node .output/server/index.mjs"]
