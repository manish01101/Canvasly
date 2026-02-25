import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { DeleteShapeSchema, CreateShapeSchema } from "@repo/common/types";
import { IncomingMessage } from "http";
import { prisma } from "@repo/db";
import http from "http";
import "dotenv/config";

const PORT = process.env.PORT || 8080;

/* ---------------- SERVER CREATION ---------------- */
const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }
  // handle other HTTP requests
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.write("WebSocket Server is running. Connect via ws://...");
  res.end();
});

const wss = new WebSocketServer({ noServer: true });

/* ---------------- CORS & UPGRADE HANDLING ---------------- */
const allowedOrigins = [
  "http://localhost:3000",
  "https://canvasly-web-seven.vercel.app",
];
server.on("upgrade", (request, socket, head) => {
  // console.log("origin is: ", request);
  // console.log("socket is: ", socket);
  // console.log("head is: ", head);
  const origin = request.headers.origin;

  if (origin && !allowedOrigins.includes(origin)) {
    console.log(`Blocked connection from unauthorized origin: ${origin}`);
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  // handle upgrade if origin is valid
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request); // this manually triggers the wss.on('connection', ...)
  });
});

// console.log(JWT_SECRET);
// console.log("server is on port: ", PORT);

interface User {
  ws: WebSocket;
  rooms: Set<string>;
  userId: string;
  name: string;
}
const users = new Map<WebSocket, User>();

/* ---------------- AUTH ---------------- */

const handleAuth = (
  request: IncomingMessage,
): { userId: string; name: string } | null => {
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
    return {
      userId: decoded.userId,
      name: decoded.name || "Unknown",
    };
  } catch (error) {
    console.error("JWT verification failed:", (error as Error).message);
    return null;
  }
};

/* ---------------- CONNECTION ---------------- */

wss.on("connection", async (ws, request) => {
  ws.on("error", console.error);

  const userIdentity = handleAuth(request);
  if (!userIdentity) {
    ws.close(4001, "Invalid or missing token");
    return;
  }

  const user: User = {
    ws,
    userId: userIdentity.userId,
    name: userIdentity.name,
    rooms: new Set(),
  };

  users.set(ws, user);

  console.log(`User connected: ${userIdentity.userId} (${userIdentity.name})`);
  ws.send(JSON.stringify({ type: "welcome", userId: userIdentity.userId }));

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
          data: { roomId, message, userId: currentUser.userId },
        })
        .catch((e: any) => console.error("Chat DB Error:", e));

      console.log(
        `CHAT from ${currentUser.userId} to room ${roomId}: ${parsedData.message}`,
      );

      // 2. then broadcast immediately
      users.forEach((user) => {
        // only send if user are in the room AND the connection is open
        if (user.rooms.has(roomId) && user.ws.readyState === WebSocket.OPEN) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message: message,
              from: currentUser.userId,
              fromName: currentUser.name,
              roomId,
            }),
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
              from: currentUser.userId,
              roomId,
            }),
          );
        }
      });
      // 2.save to db
      try {
        await prisma.shape.create({
          data: {
            id: shape.id,
            roomId,
            userId: currentUser.userId,
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
            }),
          );
        }
      });
    }
  });

  // if user close the connection
  ws.on("close", () => {
    users.delete(ws);
    console.log(`User ${userIdentity.userId} disconnected.`);
    console.log(`Total active users remaining: ${users.size}`);
  });
});

wss.on("close", function close() {
  console.log("Connection closed");
});

/* ---------------- LISTEN ON THE HTTP SERVER ---------------- */
server.listen(PORT, () => {
  console.log(`WebSocket server is listening on port ${PORT}`);
});
