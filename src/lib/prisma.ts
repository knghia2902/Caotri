import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

let localPrisma: PrismaClient | null = null;

function getLocalPrisma(): PrismaClient {
  if (!localPrisma) {
    const globalForPrisma = globalThis as unknown as {
      prisma: PrismaClient | undefined;
    };
    localPrisma =
      globalForPrisma.prisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      });
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = localPrisma;
    }
  }
  return localPrisma;
}

export function getDbClient(): PrismaClient {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    if (ctx?.env?.DB) {
      const adapter = new PrismaD1(ctx.env.DB);
      return new PrismaClient({ adapter });
    }
  } catch {
    // Fallback to local SQLite during build / local development
  }
  return getLocalPrisma();
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getDbClient();
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;

