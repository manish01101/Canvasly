import dotenv from "dotenv";
import path from "path";

// dotenv.config({
//   path: path.resolve(process.cwd(), "../../packages/backend-common/.env"),
// });

export const JWT_SECRET = process.env.JWT_SECRET || "1234234";
