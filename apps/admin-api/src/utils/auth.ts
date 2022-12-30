// Dependencies
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

// Shared
import logger from './logger';

// Workaround NX overwriting env variables at build time.
const env = {...process}.env;

const prisma = new PrismaClient();

async function ensureUserFromToken(upn: string, firstName: string, lastName: string) {
  const existing = await prisma.user.findFirst({
    where: {
      adUsername: upn
    }
  });
  if (existing) {
    return existing;
  }
  const user = await prisma.user.create({
    data: {
      adUsername: upn,
      firstName,
      lastName,
    }
  });
  // Log publishing environment creation.
  await prisma.activityLog.create({
    data: {
      action: 'create',
      resourceType: 'user',
      resourceId: user.id,
      detailText: `User ${user.firstName} ${user.lastName} logged in for the first time.`,
      createdByUserId: user.id
    }
  });
  return user;
}

export async function authorizeUserByToken(token: string) {
  try {
    const decoded = await jwt.decode(token);
    if (decoded.appid !== env.AUTH_CLIENT_ID) {
      return { valid: false, reason: 'invalid-client' };
    }
    if (!decoded.iss.includes(env.AUTH_TENANT_ID)) {
      return { valid: false, reason: 'invalid-issuer' };
    }
    // TODO: Look into expiration handling of token.
    // const now = Math.round(new Date().getTime() / 1000);
    // if (now >= decoded.exp) {
    //   return { valid: false, reason: 'token-expired' };
    // }
    const user = await ensureUserFromToken(decoded.upn, decoded.given_name, decoded.family_name);

    return { valid: true, user };
  } catch (error) {
    logger.error(error, 'Auth error');
    return {
      valid: false,
      reason: 'decode-error',
      error
    };
  }
}
