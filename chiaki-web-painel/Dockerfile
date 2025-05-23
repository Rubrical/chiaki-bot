FROM node:22.3.0 AS builder

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build -- --configuration production

FROM nginx:stable-alpine

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/chiaki-web-painel/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
