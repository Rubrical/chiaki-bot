FROM node:22.3.0 AS builder

WORKDIR /usr/src/app

RUN npm i -g ts-node typeorm

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:22.3.0

WORKDIR /usr/src/app

# Copiar todo o código-fonte e arquivos compilados
COPY --from=builder /usr/src/app/build ./build
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/tsconfig.json ./

# Certifique-se de que a pasta database existe
RUN mkdir -p ./database

EXPOSE 3000

# Criar script de inicialização
RUN echo '#!/bin/bash\n\n# Executar migrations\necho "Running database migrations..."\nnpm run migration:run\n\n# Iniciar a aplicação\necho "Starting application..."\nnode build/main' > docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

CMD ["./docker-entrypoint.sh"]