FROM node:24-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y python3 && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

CMD ["node", "--tls-min-v1.2", "--tls-max-v1.2", "dist/index.js"]
