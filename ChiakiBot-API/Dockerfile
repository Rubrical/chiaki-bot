FROM node:22.3.0-slim AS builder

WORKDIR /usr/src/app

RUN npm i -g ts-node typeorm

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:22.3.0-slim

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/app/package*.json ./
RUN npm ci --omit=dev \
    && apt-get purge -y --auto-remove build-essential python3

COPY --from=builder /usr/src/app/build ./build
COPY --from=builder /usr/src/app/docker-entrypoint.sh .

RUN mkdir -p ./database

EXPOSE 3000

RUN chmod +x docker-entrypoint.sh

CMD ["./docker-entrypoint.sh"]