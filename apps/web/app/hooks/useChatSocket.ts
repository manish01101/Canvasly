import { useEffect, useRef } from "react";

interface Chat {
  id: number;
  message: string;
  user: { name: string };
}

export function useChatSocket(
  socket: WebSocket | null,
  roomId: string,
  onMessage: (chat: Chat) => void,
) {
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!socket) return;

    const sendJoin = () => {
      socket.send(JSON.stringify({ type: "join_room", roomId }));
    };

    if (socket.readyState === WebSocket.OPEN) {
      sendJoin();
    } else {
      socket.addEventListener("open", sendJoin, { once: true });
    }

    const handle = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "chat") {
          onMessageRef.current({
            id: Date.now(),
            message: data.message,
            user: { name: data.fromName || data.from || "Someone" },
          });
        }
      } catch (err) {
        console.error("[useChatSocket] Failed to parse message", err);
      }
    };

    socket.addEventListener("message", handle);
    return () => socket.removeEventListener("message", handle);
  }, [socket, roomId]);
}
