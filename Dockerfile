FROM node:24-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends python3 ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# For an existing live server, mount its persistent volume at /app/data.
# Fail closed instead of silently creating a blank database during an upgrade.
ENV DATA_DIR=/app/data
ENV REQUIRE_EXISTING_DATABASE=true

CMD ["node", "--tls-min-v1.2", "--tls-max-v1.2", "dist/index.js"]
