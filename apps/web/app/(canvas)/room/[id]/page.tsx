"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import useSocket from "../../../hooks/useSocket";
import { BACKEND_URL } from "../../../config";
import { Canvas } from "../../../components/Canvas";

interface Chat {
  id: number;
  message: string;
  user: { name: string };
}

export default function RoomPage() {
  const { socket, loading } = useSocket();
  const params = useParams();
  const roomId = params.id as string;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const [chats, setChats] = useState<Chat[]>([]);
  const [initialShapes, setInitialShapes] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const chatBoxRef = useRef<HTMLDivElement | null>(null);

  // fetch old chats & shapes
  useEffect(() => {
    const loadChats = async () => {
      try {
        // fetch chats
        const chatRes = await axios.get(`${BACKEND_URL}/chats/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const chatArray = Array.isArray(chatRes.data)
          ? chatRes.data
          : chatRes.data.chats;
        setChats(chatArray || []);

        // fetch shapes
        const shapeRes = await axios.get(`${BACKEND_URL}/shapes/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const shapeArray = shapeRes.data.shapes.map((s: any) => {
          return { ...s.data, id: s.id };
        });
        // Assuming backend returns { shapes: [...] }
        setInitialShapes(shapeArray || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadChats();
  }, [roomId, token]);

  // websocket join + listen
  useEffect(() => {
    if (!socket || loading) return;

    socket.send(JSON.stringify({ type: "join_room", roomId }));

    const handleMessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data);

      if (data.type === "chat") {
        setChats((prev) => [
          ...prev,
          {
            id: data.id || Date.now(),
            message: data.message,
            user: { name: data.from || "Someone" },
          },
        ]);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, loading, roomId]);

  const sendMessage = () => {
    if (!message || !socket) return;

    socket.send(
      JSON.stringify({
        type: "chat",
        roomId,
        message,
      })
    );

    setMessage("");
  };

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chats]);

  return (
    <div className="flex h-screen w-screen">
      {/* Canvas */}
      <div className="flex-1 bg-gray-50 p-5">
        <div className="border-2 border-gray-300 rounded h-full flex items-center justify-center">
          {socket ? (
            <Canvas
              roomId={roomId}
              socket={socket}
              initialShapes={initialShapes}
            />
          ) : (
            "Connecting..."
          )}
        </div>
      </div>

      {/* Chat */}
      <div className="w-80 border-l border-gray-200 flex flex-col bg-white">
        <div className="p-4 font-bold border-b">Chat Room</div>

        <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-4 space-y-2">
          {chats.map((c) => (
            <div key={c.id} className="p-2 rounded bg-gray-100">
              <span className="font-semibold">
                {c.user?.name || "Unknown"}:
              </span>{" "}
              {c.message}
            </div>
          ))}
        </div>

        <div className="p-4 border-t flex gap-2">
          <input
            className="flex-1 border rounded px-3 py-2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
