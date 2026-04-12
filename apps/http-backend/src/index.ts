import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { roomSchema, signinSchema, signupSchema } from "@repo/common/types";
import { prisma } from "@repo/db";
import { middleware } from "./middleware.js";
import cors from "cors";
import "dotenv/config";
import bcrypt from "bcrypt";
import { generateOTP } from "./utils/generateOTP.js";
import { sendOTP } from "./utils/sendOTP.js";

const PORT = Number(process.env.PORT) || 8000;
// console.log(PORT);

const app = express();

app.use(
  cors({
    origin: ["https://canvasly-web-seven.vercel.app", "http://localhost:3000"],
    credentials: true,
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("HTTP server is running.");
});
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/signup", async (req, res) => {
  const parsedBody = signupSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res
      .status(400)
      .json({ message: "Invalid input", errors: parsedBody.error });
  }
  const { email, password, name } = parsedBody.data;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        otp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // send otp
    sendOTP({ email, otp });

    return res.status(200).json({
      message: "OTP sent to email",
      verificationRequired: true,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid request - User not found!" });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified!" });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otp: null,
        otpExpiresAt: null,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "5d" },
    );

    return res.json({ token, name: user.name });
  } catch (error) {
    console.error("OTP verify error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/signin", async (req, res) => {
  const parsedBody = signinSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res
      .status(400)
      .json({ message: "Invalid input", errors: parsedBody.error });
  }
  const { email, password } = parsedBody.data;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Email not verified" });
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "5d" },
    );
    return res.json({ token, name: user.name });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/room", middleware, async (req, res) => {
  // create a room id and return that
  const adminId = req.userId;
  if (!adminId) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  const parsedBody = roomSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res
      .status(400)
      .json({ message: "Invalid input", errors: parsedBody.error });
  }
  const { name } = parsedBody.data;
  try {
    const newRoom = await prisma.room.create({
      data: {
        name,
        adminId,
      },
    });
    return res.status(201).json({
      message: "Room created successfully",
      roomId: newRoom.id,
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/chats/:roomId", middleware, async (req, res) => {
  const roomId = req.params.roomId;
  try {
    const chats = await prisma.chat.findMany({
      where: {
        roomId,
      },
      orderBy: {
        id: "desc",
      },
      take: 50,
      include: {
        user: {
          select: { name: true },
        },
      },
    });
    res.json({ chats: chats.reverse() });
  } catch (error) {
    console.error("Error while fetching room's chats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/shapes/:roomId", middleware, async (req, res) => {
  const roomId = req.params.roomId;
  try {
    const shapes = await prisma.shape.findMany({
      where: {
        roomId,
      },
      orderBy: {
        id: "asc",
      },
    });
    res.json({ shapes });
  } catch (error) {
    console.error("Error while fetching room's shapes:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/room/:name", async (req, res) => {
  const name = req.params.name;
  try {
    const room = await prisma.room.findFirst({
      where: {
        name,
      },
    });
    res.json({ room });
  } catch (error) {
    console.error("Error while fetching roomId:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/rooms", async (req, res) => {
  try {
    const res = await prisma.room.findMany();
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => {
  console.log(`HTTP Server is running on ${PORT}`);
});
