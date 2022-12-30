FROM node:18-alpine

RUN apk add --no-cache make build-base python3

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn --frozen-lockfile --prod

COPY index.js ./
COPY commands ./commands
COPY events ./events

CMD ["yarn", "start"]
