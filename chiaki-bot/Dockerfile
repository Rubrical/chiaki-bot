FROM node:22.3.0-alpine as builder

WORKDIR /app

RUN apk add --no-cache python3 make g++ build-base cairo-dev pango-dev \
    libjpeg-turbo-dev giflib-dev librsvg-dev

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22.3.0-alpine
WORKDIR /app

RUN apk add --no-cache ffmpeg imagemagick libwebp

COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/src/temp
VOLUME ["/app/session", "/app/logs"]

EXPOSE 3001
ENV TZ=America/Sao_Paulo

CMD ["node", "dist/main.js"]