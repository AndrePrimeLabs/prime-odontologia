FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent || true
COPY . .
CMD ["node","index.js"]
