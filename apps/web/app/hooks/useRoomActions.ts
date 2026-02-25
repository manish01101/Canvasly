import { useState } from "react";
import axios from "axios";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { BACKEND_URL } from "../config";

export function useRoomActions(token: string, router: AppRouterInstance) {
  const [roomName, setRoomName] = useState("");
  const [createError, setCreateError] = useState("");
  const [joinError, setJoinError] = useState("");

  const createRoom = async (onSuccess: () => void) => {
    setCreateError("");
    try {
      const res = await axios.post(
        `${BACKEND_URL}/room`,
        { name: roomName },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onSuccess();
      setRoomName("");
      router.push(`/room/${res.data.roomId}`);
    } catch (err: any) {
      setCreateError(err.response?.data?.message || "Failed to create room");
    }
  };

  const joinRoom = async (onSuccess: () => void) => {
    setJoinError("");
    try {
      const res = await axios.get(`${BACKEND_URL}/room/${roomName}`);
      if (!res.data.room) {
        setJoinError("Room not found");
        return;
      }
      onSuccess();
      setRoomName("");
      router.push(`/room/${res.data.room.id}`);
    } catch {
      setJoinError("Room not found");
    }
  };

  const clearErrors = () => {
    setCreateError("");
    setJoinError("");
  };

  return {
    roomName,
    setRoomName,
    createError,
    joinError,
    clearErrors,
    createRoom,
    joinRoom,
  };
}
