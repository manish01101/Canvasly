import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "../config";
import { Shape } from "../draw/types";

interface Chat {
  id: number;
  message: string;
  user: { name: string };
}

export function useRoomData(roomId: string) {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [initialShapes, setInitialShapes] = useState<Shape[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/signin");
      return;
    }

    const load = async () => {
      try {
        const [chatRes, shapeRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/chats/${roomId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BACKEND_URL}/shapes/${roomId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setChats(chatRes.data.chats || []);

        const shapes = shapeRes.data.shapes.map((s: any) => {
          const shapeData = { ...(s.data || s) };
          if (shapeData.points && typeof shapeData.points === "string") {
            try {
              shapeData.points = JSON.parse(shapeData.points);
            } catch {
              shapeData.points = [];
            }
          }
          return { ...shapeData, id: s.id };
        });

        setInitialShapes(shapes);
      } catch (err: any) {
        // token expired or invalid — redirect to signin
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.clear();
          window.dispatchEvent(new Event("logout"));
          router.replace("/signin");
          return;
        }
        console.error(err);
        setError("Failed to load room data");
        setInitialShapes([]);
      }
    };

    load();
  }, [roomId]);

  return { chats, setChats, initialShapes, error };
}
