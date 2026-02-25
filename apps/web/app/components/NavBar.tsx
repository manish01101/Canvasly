"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { UserMenu } from "./navbar/UserMenu";
import { MobileMenu } from "./navbar/MobileMenu";
import { RoomModal } from "./navbar/RoomModal";
import { useAuth } from "../hooks/useAuth";
import { useRoomActions } from "../hooks/useRoomActions";

export default function NavBar() {
  const router = useRouter();
  const { token, name, logout } = useAuth();
  const {
    roomName,
    setRoomName,
    createError,
    joinError,
    clearErrors,
    createRoom,
    joinRoom,
  } = useRoomActions(token, router);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileOpen(false);
    router.push("/");
  };

  const openCreate = () => {
    clearErrors();
    setRoomName("");
    setIsCreateOpen(true);
  };

  const openJoin = () => {
    clearErrors();
    setRoomName("");
    setIsJoinOpen(true);
  };

  return (
    <>
      <nav className="bg-[var(--color-primary)] px-6 py-3 shadow-lg sticky top-0 z-40 text-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Logo />
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => router.push("/playground")}
              className="text-gray-200 hover:text-[var(--color-secondary)] font-medium transition"
            >
              Playground
            </button>
            <button
              onClick={openCreate}
              className="text-gray-200 hover:text-[var(--color-secondary)] font-medium transition"
            >
              Create Room
            </button>
            <button
              onClick={openJoin}
              className="text-gray-200 hover:text-[var(--color-secondary)] font-medium transition"
            >
              Join Room
            </button>

            <div className="ml-4 border-l border-white/20 pl-6">
              {token ? (
                <UserMenu name={name} onLogout={handleLogout} />
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push("/signin")}
                    className="text-white hover:text-[var(--color-secondary)] font-medium transition"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push("/signup")}
                    className="bg-[var(--color-secondary)] text-white px-5 py-2 rounded-lg font-bold hover:brightness-110 transition shadow-md"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        <MobileMenu
          isOpen={isMobileOpen}
          token={token}
          name={name}
          onCreateRoom={() => {
            openCreate();
            setIsMobileOpen(false);
          }}
          onJoinRoom={() => {
            openJoin();
            setIsMobileOpen(false);
          }}
          onLogout={handleLogout}
        />
      </nav>

      <RoomModal
        isOpen={isCreateOpen}
        title="Create a New Room"
        token={token}
        roomName={roomName}
        error={createError}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={() => createRoom(() => setIsCreateOpen(false))}
        onRoomNameChange={setRoomName}
      />

      <RoomModal
        isOpen={isJoinOpen}
        title="Join Existing Room"
        token={token}
        roomName={roomName}
        error={joinError}
        onClose={() => setIsJoinOpen(false)}
        onSubmit={() => joinRoom(() => setIsJoinOpen(false))}
        onRoomNameChange={setRoomName}
      />
    </>
  );
}
