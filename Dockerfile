FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn --frozen-lockfile --prod

COPY index.js ./
COPY commands ./commands
COPY events ./events

CMD ["yarn", "start"]
