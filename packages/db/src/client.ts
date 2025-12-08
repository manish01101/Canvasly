import dotenv from "dotenv";
import path from "path";
import pg from "pg";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

// Capture the result of the configuration attempt
const dotenvResult = dotenv.config({
  path: path.resolve(process.cwd(), "../../packages/db/.env"),
});

// --- DEBUGGING ---
if (dotenvResult.error) {
  throw dotenvResult.error;
}
if (dotenvResult.parsed && dotenvResult.parsed.DATABASE_URL) {
  console.log("Successfully parsed DATABASE_URL from file.");
  process.env.DATABASE_URL = dotenvResult.parsed.DATABASE_URL;
} else {
  console.log("DATABASE_URL was not found in the parsed .env file content.");
}
console.log("DATABASE_URL:", process.env.DATABASE_URL);
// --- END DEBUGGING ---

const connectionString = process.env.DATABASE_URL;

// Add a final safety check before using the variable
if (!connectionString || typeof connectionString !== "string") {
  console.error("Fatal Error: DATABASE_URL is missing or invalid.");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: connectionString,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
