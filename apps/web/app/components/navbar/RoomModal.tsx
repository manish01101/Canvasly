"use client";

import { useRouter } from "next/navigation";
import InputBox from "../InputBox";

interface RoomModalProps {
  isOpen: boolean;
  title: string;
  token: string;
  roomName: string;
  error: string;
  onClose: () => void;
  onSubmit: () => void;
  onRoomNameChange: (name: string) => void;
}

export function RoomModal({
  isOpen,
  title,
  token,
  roomName,
  error,
  onClose,
  onSubmit,
  onRoomNameChange,
}: RoomModalProps) {
  const router = useRouter();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md relative">
        <h2 className="text-xl font-bold mb-4 text-[var(--color-primary)]">
          {title}
        </h2>

        {token ? (
          <div className="flex flex-col gap-4">
            <InputBox
              label="Room Name"
              type="text"
              placeholder="Enter room name..."
              value={roomName}
              onchange={(e) => onRoomNameChange(e.target.value)}
              onkeydown={(e) => e.key === "Enter" && onSubmit()}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                className="px-6 py-2 bg-[var(--color-secondary)] text-white font-bold rounded-lg hover:brightness-110 transition shadow-md"
              >
                Submit
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="mb-6 text-gray-600">
              Please sign in to access this feature.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  router.push("/signin");
                  onClose();
                }}
                className="px-6 py-2 border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-bold rounded-lg hover:bg-gray-50 transition"
              >
                Sign In
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 text-sm hover:underline mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
