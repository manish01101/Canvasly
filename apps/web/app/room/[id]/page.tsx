"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import useSocket from "../../hooks/useSocket";

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
  const [message, setMessage] = useState("");

  const chatBoxRef = useRef<HTMLDivElement | null>(null);

  // fetch old chats
  useEffect(() => {
    const loadChats = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Ensure array
        const chatArray = Array.isArray(res.data) ? res.data : res.data.chats;
        setChats(chatArray || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadChats();
  }, [roomId, token]);

  // websocket join + listen
  useEffect(() => {
    if (!socket || loading) return;

    // join room
    socket.send(JSON.stringify({ type: "join_room", roomId }));

    socket.onmessage = (e) => {
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

  // scroll bottom
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chats]);

  return (
    <div className="flex h-screen">
      <div className="flex-1 bg-gray-50 p-5">
        <h2 className="text-2xl font-bold mb-4">Canvas Area</h2>
        <div className="border-2 border-gray-300 rounded h-full flex items-center justify-center text-gray-400">
          Excalidraw Canvas Here
        </div>
      </div>

      <div className="w-96 border-l border-gray-200 flex flex-col">
        <div className="p-4 font-bold border-b">Chat</div>

        <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-4 space-y-2">
          {Array.isArray(chats) &&
            chats.map((c) => (
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

// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { useSocket } from "../../hooks/useSocket";
// import { useParams } from "next/navigation";
// import axios from "axios";
// import { BACKEND_URL } from "../../config";

// interface Chat {
//   id: number;
//   message: string;
//   user: { name: string };
// }

// const RoomPage = () => {
//   const { socket, loading } = useSocket();
//   const params = useParams();
//   const roomId = params.id as string;
//   const token =
//     typeof window !== "undefined" ? localStorage.getItem("token") : "";
//   const [chats, setChats] = useState<Chat[]>([]);
//   const [message, setMessage] = useState("");
//   const wsRef = useRef<WebSocket | null>(null);
//   const chatBoxRef = useRef<HTMLDivElement | null>(null);

//   // connect with the room
//   useEffect(() => {
//     // first fetch the old msg
//     const getOldChats = async () => {
//       try {
//         const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setChats(res.data);
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     getOldChats();
//   }, [roomId, token]);

//   // connecting with websocket
//   useEffect(() => {
//     if (!token) return;

//     if (socket && !loading) {
//       socket.send(JSON.stringify({ type: "join_room", roomId }));

//       socket.onmessage = (e) => {
//         const parsedData = JSON.parse(e.data);
//         if (parsedData.type === "chat") {
//           setChats((prev) => [
//             ...prev,
//             {
//               id: parsedData.id || Date.now(),
//               message: parsedData.message,
//               user: { name: "Someone" },
//             },
//           ]);
//         }
//       };
//     }
//   }, [roomId, token]);

//   const sendMessage = () => {
//     if (!message || !wsRef.current) return;
//     wsRef.current.send(
//       JSON.stringify({ type: "chat", roomId, userId: token, message })
//     );
//     setMessage("");
//   };

//   // Scroll chat to bottom
//   useEffect(() => {
//     if (chatBoxRef.current) {
//       chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
//     }
//   }, [chats]);

//   return (
//     <div className="flex h-screen">
//       {/* Canvas placeholder */}
//       <div className="flex-1 bg-gray-50 p-5">
//         <h2 className="text-2xl font-bold mb-4">Canvas Area</h2>
//         <div className="border-2 border-gray-300 rounded h-full flex items-center justify-center text-gray-400">
//           Excalidraw Canvas Here
//         </div>
//       </div>

//       {/* Chat panel */}
//       <div className="w-96 border-l border-gray-200 flex flex-col">
//         <div className="p-4 font-bold border-b">Chat</div>
//         <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-4 space-y-2">
//           {chats.map((c) => (
//             <div key={c.id} className="p-2 rounded bg-gray-100">
//               <span className="font-semibold">{c.user.name}:</span> {c.message}
//             </div>
//           ))}
//         </div>
//         <div className="p-4 border-t flex gap-2">
//           <input
//             className="flex-1 border rounded px-3 py-2"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//             placeholder="Type a message..."
//           />
//           <button
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//             onClick={sendMessage}
//           >
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RoomPage;
