import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { smcsDb?: PrismaClient };
export const db = globalForPrisma.smcsDb ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.smcsDb = db;
