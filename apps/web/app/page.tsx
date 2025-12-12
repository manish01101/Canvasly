"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

import { useRouter } from "next/navigation";
import { BACKEND_URL } from "./config";

interface Room {
  id: string;
  name: string;
}

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/signin");
        return;
      }

      try {
        const res = await axios.get(`${BACKEND_URL}/room`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRooms(res.data.rooms);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRooms();
  }, []);

  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold mb-6">Rooms</h1>
      <ul>
        {rooms.map((room) => (
          <li
            key={room.id}
            className="cursor-pointer p-3 border-b hover:bg-gray-100 rounded"
            onClick={() => router.push(`/room/${room.id}`)}
          >
            {room.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Rooms;
