// packages/backend-common/src/index.ts
import "dotenv/config";

// Using a function prevents the "hoisting/undefined" issue
export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // This will help you catch the error early
    console.error("CRITICAL ERROR: JWT_SECRET is not defined in environment variables!");
    return "fallback_for_local_dev_only"; 
  }
  return secret;
};