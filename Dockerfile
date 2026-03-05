FROM node:22-slim AS build

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/.output .output
COPY --from=build /app/node_modules/.prisma node_modules/.prisma
COPY --from=build /app/node_modules/@prisma node_modules/@prisma
COPY --from=build /app/node_modules/prisma node_modules/prisma
COPY --from=build /app/prisma prisma
COPY --from=build /app/package.json .

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node .output/server/index.mjs"]
