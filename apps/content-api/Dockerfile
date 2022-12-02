#Jenkins to old cant use
#Image to run final build on
#FROM --platform=linux/amd64 node:16.17.1-bullseye-slim AS final
#RUN apt update && apt -y install openssl && corepack enable && corepack prepare pnpm@latest --activate && apt clean

FROM node:16.17.1-bullseye-slim
RUN apt update && apt -y install openssl && corepack enable && corepack prepare pnpm@latest --activate && apt clean
ENV NX_UPLOAD_DIR "/data"
WORKDIR /app
COPY . .
RUN pnpm install  --shamefully-hoist && pnpm build content-api && npm pkg delete scripts.prepare

FROM node:16.17.1-bullseye-slim
RUN apt update && apt -y install openssl && corepack enable && corepack prepare pnpm@latest --activate && apt clean
ENV NX_UPLOAD_DIR "/data"
COPY --from=0 ./app/prisma ./prisma/ 
COPY --from=0 ./app/package.json ./app/pnpm-lock.yaml ./app/pnpm-workspace.yaml ./ 
COPY --from=0 ./app/node_modules ./node_modules 
COPY --from=0 --chown=node:node ./app/dist/apps/content-api ./ 
COPY --from=0 --chown=node:node ./app/apps/content-api/startup.sh ./startup.sh

EXPOSE 3000
ENV PORT 3000

CMD ["sh", "startup.sh"]
