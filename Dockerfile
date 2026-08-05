FROM node:22-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 4004
CMD ["./entrypoint.sh"]
