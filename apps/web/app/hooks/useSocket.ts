import { useEffect, useRef, useState } from "react";
import { WEBSOCKET_URL } from "../config";
import React from "react";

const useSocket = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const ws = new WebSocket(`${WEBSOCKET_URL}?token=${token}`);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WS connected");
      setLoading(false);
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);

    ws.onclose = () => console.log("WebSocket closed");

    return () => {
      ws.close();
    };
  }, []);

  return {
    socket: socketRef.current,
    loading,
  };
};

export default useSocket;
