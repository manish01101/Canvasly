"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface MobileMenuProps {
  isOpen: boolean;
  token: string;
  name: string;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onLogout: () => void;
}

export function MobileMenu({
  isOpen,
  token,
  name,
  onCreateRoom,
  onJoinRoom,
  onLogout,
}: MobileMenuProps) {
  const router = useRouter();
  if (!isOpen) return null;

  return (
    <div className="md:hidden absolute top-full left-0 w-full bg-[var(--color-primary)] border-t border-white/10 shadow-xl flex flex-col p-4 gap-2 animate-in slide-in-from-top-5">
      <button
        onClick={() => router.push("/playground")}
        className="text-white text-left py-3 px-4 rounded hover:bg-white/10 font-medium"
      >
        Playground
      </button>
      <button
        onClick={onCreateRoom}
        className="text-white text-left py-3 px-4 rounded hover:bg-white/10 font-medium"
      >
        Create Room
      </button>
      <button
        onClick={onJoinRoom}
        className="text-white text-left py-3 px-4 rounded hover:bg-white/10 font-medium"
      >
        Join Room
      </button>

      <div className="h-px bg-white/10 my-2" />

      {token ? (
        <button
          onClick={onLogout}
          className="text-red-300 text-left py-3 px-4 rounded hover:bg-white/10 font-medium flex items-center gap-2"
        >
          <LogOut size={18} /> Logout ({name})
        </button>
      ) : (
        <div className="flex flex-col gap-3 mt-2">
          <button
            onClick={() => router.push("/signin")}
            className="w-full py-3 rounded-lg border border-white/30 text-white font-medium hover:bg-white/10"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push("/signup")}
            className="w-full py-3 rounded-lg bg-[var(--color-secondary)] text-white font-bold shadow-md"
          >
            Sign Up
          </button>
        </div>
      )}
    </div>
  );
}
