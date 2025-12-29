import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
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
      await prisma.chat.create({
        data: {
          roomId,
          message,
          userId,
        },
      });
      console.log(
        `CHAT from ${currentUser.userId} to room ${roomId}: ${parsedData.message}`
      );
      users.forEach((user) => {
        // only send if user are in the room AND the connection is open
        if (user.rooms.has(roomId) && user.ws.readyState === WebSocket.OPEN) {
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
      const { roomId, shape } = parsedData;

      if (typeof roomId !== "string" || !shape || !shape.type) return;
      try {
        await prisma.shape.create({
          data: {
            roomId,
            userId,
            type: shape.type,
            data: shape,
          },
        });
        // broadcast to everyone
        users.forEach((u) => {
          if (u.rooms.has(roomId) && u.ws.readyState === WebSocket.OPEN) {
            u.ws.send(
              JSON.stringify({
                type: "draw",
                shape,
                from: userId,
                roomId,
              })
            );
          }
        });
      } catch (error) {
        console.log("Error saving shape to DB:", error);
      }
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
