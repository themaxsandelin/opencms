#!/bin/sh
pnpm prisma migrate deploy
node main.js