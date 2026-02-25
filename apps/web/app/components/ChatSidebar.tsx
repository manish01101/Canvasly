"use client";

import { useEffect, useRef, useState } from "react";

interface Chat {
  id: number;
  message: string;
  user: { name: string };
}

interface ChatSidebarProps {
  isOpen: boolean;
  chats: Chat[];
  currentUserName: string;
  onSend: (message: string) => void;
}

export function ChatSidebar({
  isOpen,
  chats,
  currentUserName,
  onSend,
}: ChatSidebarProps) {
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");

  // Auto scroll
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chats, isOpen]);

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  };

  return (
    <div
      className={`fixed right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-800 shadow-2xl transition-transform duration-300 ease-in-out z-40 flex flex-col ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-2 mt-16">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="font-semibold text-gray-200">Live Chat</span>
      </div>

      {/* Messages */}
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

      {/* Input */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex gap-2 bg-gray-800 p-1 rounded-lg border border-gray-700 focus-within:border-blue-500 transition-colors">
          <input
            className="flex-1 bg-transparent border-none text-sm px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 p-2 rounded-md hover:bg-blue-500 transition text-white"
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
  );
}
