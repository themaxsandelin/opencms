#!/bin/sh
#pnpm prisma generate
pnpm prisma migrate deploy
./node_modules/.bin/env-cmd -f ./app/env/.env node main.js