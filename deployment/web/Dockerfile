# syntax=docker/dockerfile:1
# Build context is the repository root.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json tailwind.config.js postcss.config.js components.json ./
COPY src ./src
COPY public ./public
ARG VITE_BFF_TOKEN=
ENV VITE_BFF_TOKEN=${VITE_BFF_TOKEN}
# VITE_API_BASE_URL stays empty: the web container proxies /api → bff (same origin).
RUN npm run build

FROM nginx:alpine
COPY deployment/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
