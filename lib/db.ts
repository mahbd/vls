import { PrismaClient } from '@prisma/client';

declare global {
  // Allow global `var` declarations for the Prisma client
  var prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'], // Log all queries to the console
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;