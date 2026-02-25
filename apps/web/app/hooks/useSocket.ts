import { useEffect, useState } from "react";
import { WEBSOCKET_URL } from "../config";
import { useRouter } from "next/navigation";

const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    // If no token, we cannot connect.
    // Ideally redirect to login here or handle in UI.
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
