# Multi-stage Dockerfile for PropPilot ai-agent (Next.js)
# Local Compose / self-host only. Production deploy target: Vercel (not AWS).

FROM node:22.14.0-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM node:22.14.0-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22.14.0-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup -g 10001 -S proppilot && adduser -S -u 10001 -G proppilot proppilot
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/drizzle ./drizzle
USER 10001:10001
EXPOSE 13447
ENV PORT=13447
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
