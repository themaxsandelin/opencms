#!/bin/sh
#pnpm prisma generate
pnpm prisma migrate deploy
node main.js