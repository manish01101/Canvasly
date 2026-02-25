"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MessageSquare, X, LogOut } from "lucide-react";
import { RoomCanvas } from "../../components/RoomCanvas";
import { ChatSidebar } from "../../components/ChatSidebar";
import { useRoomData } from "../../hooks/useRoomData";
import { useChatSocket } from "../../hooks/useChatSocket";
import useSocket from "../../hooks/useSocket";

const MemoizedRoomCanvas = React.memo(RoomCanvas);

export default function RoomPage() {
  const { socket, loading } = useSocket();
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentUserName, setCurrentUserName] = useState("");
  const [timeoutError, setTimeoutError] = useState(false);

  const { chats, setChats, initialShapes } = useRoomData(roomId);

  useChatSocket(socket, roomId, (chat) => {
    setChats((prev) => [...prev, chat]);
  });

  useEffect(() => {
    setCurrentUserName(localStorage.getItem("name") || "");
  }, []);

  // Timeout — only trigger if socket never connected after 10s
  useEffect(() => {
    if (!loading) return;
    if (socket) return;
    const timer = setTimeout(() => setTimeoutError(true), 5000);
    return () => clearTimeout(timer);
  }, [loading, socket]);

  const sendMessage = (message: string) => {
    if (!socket) return;
    socket.send(JSON.stringify({ type: "chat", roomId, message }));
  };

  // Canvas is ready only when BOTH socket is open AND shapes are loaded
  const isCanvasReady = !loading && !!socket && initialShapes !== null;

  return (
    <div className="flex h-screen w-screen bg-black text-white overflow-hidden relative">
      {/* Top Right Controls */}
      <div className="fixed top-4 right-4 z-50 flex gap-4">
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

        <button
          onClick={() => router.push("/")}
          className="bg-gray-800 hover:bg-red-600 p-3 rounded-full shadow-xl border border-gray-600 hover:border-red-500 transition-all text-white flex items-center justify-center"
          title="Leave Room"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative bg-black h-full w-full">
        {isCanvasReady ? (
          <MemoizedRoomCanvas
            roomId={roomId}
            socket={socket!}
            initialShapes={initialShapes}
          />
        ) : timeoutError ? (
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
          <div className="h-full flex items-center justify-center text-gray-400 animate-pulse">
            Initializing Canvas...
          </div>
        )}
      </div>

      {/* Chat */}
      <ChatSidebar
        isOpen={isChatOpen}
        chats={chats}
        currentUserName={currentUserName}
        onSend={sendMessage}
      />
    </div>
  );
}
