FROM node:22-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY index.js ./
COPY commands ./commands
COPY events ./events

CMD ["pnpm", "start"]
