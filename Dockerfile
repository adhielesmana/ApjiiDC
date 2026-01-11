# Stage base: node + pnpm
FROM node:20-alpine AS base
RUN npm install -g pnpm

# Stage deps: install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --force

# Stage builder: build Next.js
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV NEXT_PUBLIC_OAUTH_CLIENT_ID=${NEXT_PUBLIC_OAUTH_CLIENT_ID}
ENV NEXT_PUBLIC_OAUTH_REDIRECT_URL=${NEXT_PUBLIC_OAUTH_REDIRECT_URL}
RUN pnpm build

# Stage runner: production-ready, turunan dari base (pnpm sudah ada)
FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs \
    && adduser  --system --uid 1001 --ingroup nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/package.json       ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/pnpm-lock.yaml    ./pnpm-lock.yaml
COPY --from=builder --chown=nextjs:nodejs /app/public            ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next             ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules      ./node_modules

ENV NODE_ENV=production
ENV PORT=3000

USER nextjs
EXPOSE 3000
CMD ["pnpm", "start"]
