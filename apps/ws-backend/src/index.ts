import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { DeleteShapeSchema, CreateShapeSchema } from "@repo/common/types";
import { IncomingMessage } from "http";
import { prisma } from "@repo/db";
import "dotenv/config";

const PORT = process.env.PORT || 8080;

const wss = new WebSocketServer({ port: Number(PORT) });

console.log(JWT_SECRET);
console.log("server is on port: ", PORT);

interface User {
  ws: WebSocket;
  rooms: Set<string>;
  userId: string;
}
const users = new Map<WebSocket, User>();

/* ---------------- AUTH ---------------- */

const handleAuth = (request: IncomingMessage): string | null => {
  let token: string | null = null;

  // check header first
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1] || "";
  }

  // if not header fallback to query params
  if (!token && request.url) {
    const urlParts = request.url.split("?");
    if (urlParts.length > 1) {
      const queryParams = new URLSearchParams(urlParts[1]);
      token = queryParams.get("token");
    }
  }

  if (!token) {
    console.error("Connection attempt failed: No JWT token provided.");
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded.userId || null;
  } catch (error) {
    console.error("JWT verification failed:", (error as Error).message);
    return null;
  }
};

/* ---------------- CONNECTION ---------------- */

wss.on("connection", (ws, request) => {
  ws.on("error", console.error);

  // find the userId
  const userId = handleAuth(request);
  if (!userId) {
    ws.close(4001, "Invalid or missing token");
    return;
  }

  const user: User = {
    ws,
    userId,
    rooms: new Set(),
  };

  users.set(ws, user);

  console.log(`User connected: ${userId}`);
  ws.send(JSON.stringify({ type: "welcome", userId }));

  /* ---------------- MESSAGE HANDLER ---------------- */

  ws.on("message", async (data) => {
    // console.log(users);
    // TODO: type checking for parsedData
    let parsedData;
    try {
      parsedData = JSON.parse(data.toString());
    } catch (err) {
      console.error("Invalid JSON:", data.toString());
      return;
    }

    const currentUser = users.get(ws);
    if (!currentUser) return;

    /* ---------- JOIN ROOM ---------- */
    if (parsedData.type === "join_room") {
      if (typeof parsedData.roomId !== "string") return;
      currentUser.rooms.add(parsedData.roomId);
      console.log(`${currentUser.userId} joined room ${parsedData.roomId}`);
    }

    /* ---------- LEAVE ROOM ---------- */
    if (parsedData.type === "leave_room") {
      if (typeof parsedData.roomId !== "string") return;
      currentUser.rooms.delete(parsedData.roomId);
      console.log(`${currentUser.userId} left room ${parsedData.roomId}`);
    }

    /* ---------- CHAT ---------- */
    if (parsedData.type === "chat") {
      if (typeof parsedData.roomId !== "string") return;
      if (typeof parsedData.message !== "string") return;

      const { roomId, message } = parsedData;
      // best way to use msg queue
      // await prisma.chat.create({
      //   data: {
      //     roomId,
      //     message,
      //     userId,
      //   },
      // });

      // 1. Save to DB asynchronously (don't block broadcast)
      prisma.chat
        .create({
          data: { roomId, message, userId },
        })
        .catch((e) => console.error("Chat DB Error:", e));

      console.log(
        `CHAT from ${currentUser.userId} to room ${roomId}: ${parsedData.message}`
      );

      // 2. then broadcast immediately
      users.forEach((user) => {
        // only send if user are in the room AND the connection is open
        if (
          user.rooms.has(roomId) &&
          user.ws.readyState === WebSocket.OPEN &&
          user.ws !== ws
        ) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message: message,
              from: currentUser.userId,
              roomId,
            })
          );
        }
      });
    }

    /* ---------- DRAW ---------- */
    if (parsedData.type === "draw") {
      const resParsedData = CreateShapeSchema.safeParse(parsedData);
      if (!resParsedData.success) {
        console.error("Invalid shape data", resParsedData.error);
        return;
      }
      const { roomId, shape } = resParsedData.data;

      if (typeof roomId !== "string" || !shape || !shape.type) return;

      // 1.broadcast to everyone immediately (low latency)
      users.forEach((user) => {
        if (
          user.rooms.has(roomId) &&
          user.ws.readyState === WebSocket.OPEN &&
          user.ws !== ws
        ) {
          user.ws.send(
            JSON.stringify({
              type: "draw",
              shape,
              from: userId,
              roomId,
            })
          );
        }
      });
      // 2.save to db
      try {
        await prisma.shape.create({
          data: {
            id: shape.id,
            roomId,
            userId,
            type: shape.type,
            data: shape,
          },
        });
      } catch (error) {
        console.log("Error saving shape to DB:", error);
      }
    }

    /* ---------- DELETE ---------- */
    if (parsedData.type === "delete_shape") {
      const resParsedData = DeleteShapeSchema.safeParse(parsedData);
      if (!resParsedData.success) {
        console.log("Invalid delete payload");
        return;
      }

      const { shapeId, roomId } = resParsedData.data;
      // 1. delete from db
      try {
        await prisma.shape.delete({
          where: { id: shapeId },
        });
      } catch (error) {
        console.log("DB Delete Error (likely already deleted):", error);
      }

      // 2.broadcast to everyone
      users.forEach((user) => {
        if (
          user.rooms.has(roomId) &&
          user.ws.readyState === WebSocket.OPEN &&
          user.ws !== ws
        ) {
          user.ws.send(
            JSON.stringify({
              type: "delete_shape",
              shapeId: shapeId,
              roomId: roomId,
            })
          );
        }
      });
    }
  });

  // if user close the connection
  ws.on("close", () => {
    users.delete(ws);
    console.log(`User ${userId} disconnected.`);
    console.log(`Total active users remaining: ${users.size}`);
  });
});

wss.on("close", function close() {
  console.log("Connection closed");
});
