import { PrismaClient } from "@prisma/client";

const DEFAULT_DATABASE_URL =
  "postgresql://neondb_owner:npg_1cLPkeRG7pEb@ep-late-glade-b5jtr33d-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true";
const DEFAULT_DIRECT_URL =
  "postgresql://neondb_owner:npg_1cLPkeRG7pEb@ep-late-glade-b5jtr33d-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = DEFAULT_DATABASE_URL;
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = DEFAULT_DIRECT_URL;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}

// Lazy proxy: prevents PrismaClient from instantiating during Next.js build-time module evaluation on Vercel
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

