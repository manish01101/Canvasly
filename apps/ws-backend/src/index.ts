import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

const wss = new WebSocketServer({ port: 8080 });

console.log(JWT_SECRET);

wss.on("connection", function connection(ws, request) {
  ws.on("error", console.error);

  let token: string | null = null;
  // check header first
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1] || "";
  }
  //fallback to query params
  if (!token && request.url) {
    const queryParams = new URLSearchParams(request.url.split("?")[1]);
    token = queryParams.get("token");
  }
  if (!token) {
    console.error("Connection attempt failed: No JWT token provided.");
    ws.close();
    return;
  }

  const decoded = jwt.verify(token, JWT_SECRET);
  if (!decoded || !(decoded as JwtPayload).userId) {
    ws.close();
    return;
  }
  ws.on("message", function message(data) {
    console.log("received: %s", data);
    ws.send("hi there");
  });

  ws.send("something");
});
