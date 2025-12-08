import { z } from "zod";

export const signupSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  name: z.string(),
});

export const signinSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const roomSchema = z.object({
  name: z.string().min(3).max(20),
});
