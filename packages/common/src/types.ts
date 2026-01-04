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

export const CreateShapeSchema = z.object({
  roomId: z.string(),
  message: z.string().optional(),
  shape: z.object({
    id: z.string(), // frontend generates UUIDs
    type: z.enum(["rect", "circle", "ellipse", "pencil", "eraser"]),

    // Rectangle properties
    x: z.number().optional(),
    y: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),

    // Circle properties
    centerX: z.number().optional(),
    centerY: z.number().optional(),
    radius: z.number().optional(),

    // ellipse properties
    radiusX: z.number().optional(),
    radiusY: z.number().optional(),

    // Pencil & Eraser properties
    points: z
      .array(
        z.object({
          x: z.number(),
          y: z.number(),
        })
      )
      .optional(),

    color: z.string().optional(),
    strokeWidth: z.number().optional(),
  }),
});

export const DeleteShapeSchema = z.object({
  roomId: z.string(),
  shapeId: z.string(), // Used to identify the shape to remove
});
