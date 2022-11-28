#!/bin/sh
pnpm prisma generate
pnpm prisma migrate dev
node main.js