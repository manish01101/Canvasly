import { useEffect, useState } from "react";
import { WEBSOCKET_URL } from "../config";
import { useRouter } from "next/navigation";

export const useSocket = (token: string | null) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace("/signin");
      setLoading(false);
      return;
    }

    const ws = new WebSocket(`${WEBSOCKET_URL}?token=${token}`);

    ws.onopen = () => {
      console.log("WS connected");
      setSocket(ws);
      setLoading(false);
    };

    ws.onerror = (err) => {
      console.log("WebSocket error:", err);
      setLoading(false);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      setSocket(null);
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, []);

  return { socket, loading };
};

export default useSocket;
