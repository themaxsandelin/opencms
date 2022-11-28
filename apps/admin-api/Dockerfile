FROM --platform=linux/amd64 node:16.17.1-alpine

WORKDIR /app

# Install pnpm and prepare for running pnpm install.
RUN apk add --no-cache libc6-compat
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*
RUN apk --no-cache add openssl libc6-compat
RUN apk add --no-cache --upgrade bash
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY prisma ./prisma/
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm pkg delete scripts.prepare

# Possibly install pnpm here.
RUN pnpm install

COPY --chown=node:node ./dist/apps/admin-api ./
COPY --chown=node:node ./apps/admin-api/startup.sh ./startup.sh

EXPOSE 3000
ENV PORT 3000

CMD ["sh", "startup.sh"]
