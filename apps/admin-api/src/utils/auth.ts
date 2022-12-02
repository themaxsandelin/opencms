// Dependencies
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

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
  return prisma.user.create({
    data: {
      adUsername: upn,
      firstName,
      lastName,
    }
  });
}

export async function authorizeUserByToken(token: string) {
  try {
    const decoded = await jwt.decode(token);
    if (decoded.appid !== process.env.NX_AUTH_CLIENT_ID) {
      return { valid: false, reason: 'invalid-client' };
    }
    if (!decoded.iss.includes(process.env.NX_AUTH_TENANT_ID)) {
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
    console.error('JWT decoding error.', error);
    return {
      valid: false,
      reason: 'decode-error',
      error
    };
  }
}
