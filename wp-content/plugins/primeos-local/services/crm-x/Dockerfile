# Multi-arch base image — builds natively on the Pandora's ARM64 CPU
# and on x86 dev machines without any extra flags.
FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 4001

CMD ["node", "src/index.js"]
