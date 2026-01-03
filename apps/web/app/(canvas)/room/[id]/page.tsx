"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { BACKEND_URL } from "../../../config";
import { Canvas } from "../../../components/Canvas";
import useSocket from "../../../hooks/useSocket";
import { MessageSquare, X, LogOut } from "lucide-react";

interface Chat {
  id: number;
  message: string;
  user: { name: string };
}

// Memoized Canvas prevents re-renders when chat state changes
const MemoizedCanvas = React.memo(Canvas);

export default function RoomPage() {
  const { socket, loading } = useSocket();
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [chats, setChats] = useState<Chat[]>([]);
  const [initialShapes, setInitialShapes] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement | null>(null);
  const [currentUserName, setCurrentUserName] = useState("");
  const [timeoutError, setTimeoutError] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUserName(localStorage.getItem("name") || "");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const loadData = async () => {
      try {
        const chatRes = await axios.get(`${BACKEND_URL}/chats/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChats(chatRes.data.chats || []);

        const shapeRes = await axios.get(`${BACKEND_URL}/shapes/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const shapeArray = shapeRes.data.shapes.map((s: any) => {
          // 1. handle if data is wrapped in a 'data' field or flattened
          const shapeData = s.data || s;

          // 2. parse points if they are a string
          if (shapeData.points && typeof shapeData.points === "string") {
            try {
              shapeData.points = JSON.parse(shapeData.points);
            } catch (e) {
              console.error("Failed to parse points:", e);
              shapeData.points = [];
            }
          }

          return {
            ...shapeData,
            id: s.id,
          };
        });
        setInitialShapes(shapeArray || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, [roomId]);

  useEffect(() => {
    if (!socket || loading) return;

    socket.send(JSON.stringify({ type: "join_room", roomId }));

    const handleMessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      if (data.type === "chat") {
        setChats((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: data.message,
            user: { name: data.from || "Someone" },
          },
        ]);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, loading, roomId]);

  const sendMessage = () => {
    if (!message || !socket) return;
    socket.send(JSON.stringify({ type: "chat", roomId, message }));
    setMessage("");
  };

  const handleLeaveRoom = () => {
    router.push("/");
  };

  // Auto scroll when chat updates or opens
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chats, isChatOpen]);

  // for loading
  useEffect(() => {
    if (loading && !socket) {
      const timer = setTimeout(() => {
        setTimeoutError(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [loading, socket]);

  return (
    <div className="flex h-screen w-screen bg-black text-white overflow-hidden relative">
      {/* --- TOP RIGHT CONTROLS --- */}
      <div className="fixed top-4 right-4 z-50 flex gap-4">
        {/* Chat Toggle Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`p-3 rounded-full shadow-xl border transition-all text-white flex items-center justify-center ${
            isChatOpen
              ? "bg-blue-600 border-blue-400"
              : "bg-gray-800 hover:bg-gray-700 border-gray-600"
          }`}
          title="Chat"
        >
          {isChatOpen ? <X size={20} /> : <MessageSquare size={20} />}
        </button>

        {/* Leave Room Button */}
        <button
          onClick={handleLeaveRoom}
          className="bg-gray-800 hover:bg-red-600 p-3 rounded-full shadow-xl border border-gray-600 hover:border-red-500 transition-all text-white flex items-center justify-center"
          title="Leave Room"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* --- CANVAS --- */}
      <div className="flex-1 relative bg-black h-full w-full">
        {!loading && socket ? (
          <MemoizedCanvas
            roomId={roomId}
            socket={socket}
            initialShapes={initialShapes}
          />
        ) : timeoutError ? (
          // TIMEOUT UI
          <div className="h-full flex flex-col items-center justify-center text-red-400 gap-4">
            <p>Connection timed out.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white text-black rounded"
            >
              Retry
            </button>
          </div>
        ) : (
          // LOADING UI
          <div className="h-full flex items-center justify-center text-gray-400 animate-pulse">
            Initializing Canvas...
          </div>
        )}
      </div>

      {/* --- CHAT SIDEBAR --- */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-800 shadow-2xl transition-transform duration-300 ease-in-out z-40 flex flex-col ${
          isChatOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-800 flex items-center gap-2 mt-16">
          {" "}
          {/* Increased mt for spacing */}
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="font-semibold text-gray-200">Live Chat</span>
        </div>

        <div
          ref={chatBoxRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700"
        >
          {chats.map((c) => {
            const isMe = c.user?.name === currentUserName;
            return (
              <div
                key={c.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <span className="text-xs text-gray-500 mb-1 px-1">
                  {isMe ? "You" : c.user?.name}
                </span>
                <div
                  className={`px-3 py-2 rounded-2xl text-sm max-w-[90%] break-words ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-800 text-gray-200 rounded-bl-none"
                  }`}
                >
                  {c.message}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-800 bg-gray-900">
          <div className="flex gap-2 bg-gray-800 p-1 rounded-lg border border-gray-700 focus-within:border-blue-500 transition-colors">
            <input
              className="flex-1 bg-transparent border-none text-sm px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
            />
            <button
              className="bg-blue-600 p-2 rounded-md hover:bg-blue-500 transition text-white"
              onClick={sendMessage}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
