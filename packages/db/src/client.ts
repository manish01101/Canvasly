import dotenv from "dotenv";
import path from "path";
import pg from "pg";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

// --- DEBUGGING ---
if (!process.env.DATABASE_URL) {
  // Capture the result of the configuration attempt
  const dotenvResult = dotenv.config({
    path: path.resolve(process.cwd(), "../../packages/db/.env"),
  });

  if (dotenvResult.error) {
    console.warn(
      "Could not load .env file. Relying on system environment variables."
    );
  } else {
    console.log("Loaded environment variables from file.");
  }
} else {
  console.log("Using pre-existing DATABASE_URL from environment.");
}
// console.log("DATABASE_URL:", process.env.DATABASE_URL);
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
