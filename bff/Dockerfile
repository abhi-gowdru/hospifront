# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json tsconfig.json tsconfig.build.json ./
RUN npm install
COPY src ./src
RUN npx tsc -p tsconfig.build.json

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
EXPOSE 3001
USER node
CMD ["node", "dist/index.js"]
