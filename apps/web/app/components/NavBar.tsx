"use client";

import React, { useEffect, useRef, useState } from "react";
import InputBox from "./InputBox";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import { Menu, X, LogOut, ChevronDown } from "lucide-react";

const NavBar = () => {
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isJoinRoomOpen, setIsJoinRoomOpen] = useState(false);
  const [isMeOpen, setIsMeOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [roomName, setRoomName] = useState("");
  const meRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const [token, setToken] = useState("");
  const [name, setName] = useState("");

  // --- Auth State Management ---
  useEffect(() => {
    const updateAuth = () => {
      setToken(localStorage.getItem("token") || "");
      setName(localStorage.getItem("name") || "");
    };
    updateAuth();

    window.addEventListener("login", updateAuth);
    window.addEventListener("logout", updateAuth);
    return () => {
      window.removeEventListener("login", updateAuth);
      window.removeEventListener("logout", updateAuth);
    };
  }, []);

  // --- Click Outside Logic ---
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isMeOpen &&
        meRef.current &&
        !meRef.current.contains(e.target as Node)
      ) {
        setIsMeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMeOpen]);

  // --- Handlers ---
  const handleCreateRoom = async () => {
    const tkn = `Bearer ${token}`;
    console.log("token is: ", tkn);
    console.log(roomName);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/room`,
        { name: roomName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("room is created", res.data);
      setIsCreateRoomOpen(false);
      setRoomName("");
      router.push(`/room/${res.data.roomId}`); //  auto-redirect
    } catch (error: any) {
      console.log("Error creating room:", error.response.data.message);
    }
  };

  const handleJoinRoom = async () => {
    const tkn = `Bearer ${token}`;
    console.log("token is: ", tkn);
    console.log(roomName);
    try {
      const res = await axios.get(`${BACKEND_URL}/room/${roomName}`);
      console.log("room is fetched successfully:", res.data);
      console.log("room id:", res.data.room.id);
      setIsJoinRoomOpen(false);
      setRoomName("");
      router.push(`/room/${res.data.room.id}`);
    } catch (error) {
      alert("Room not found!");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("logout"));
    setIsMeOpen(false);
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  return (
    <>
      <nav className="bg-[var(--color-primary)] px-6 py-3 shadow-lg sticky top-0 z-40 text-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo Section */}
          <div
            className="flex items-center gap-2"
            onClick={() => router.push("/")}
          >
            <Logo />
          </div>

          {/* --- DESKTOP MENU --- */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => setIsCreateRoomOpen(true)}
              className="text-gray-200 hover:text-[var(--color-secondary)] font-medium transition cursor-pointer"
            >
              Create Room
            </button>

            <button
              onClick={() => setIsJoinRoomOpen(true)}
              className="text-gray-200 hover:text-[var(--color-secondary)] font-medium transition cursor-pointer"
            >
              Join Room
            </button>

            {/* Auth Section */}
            <div className="ml-4 border-l border-white/20 pl-6" ref={meRef}>
              {token ? (
                // IF LOGGED IN: Showing User Profile
                <div className="relative">
                  <button
                    onClick={() => setIsMeOpen(!isMeOpen)}
                    className="flex items-center gap-3 hover:opacity-90 transition group"
                  >
                    <div className="w-9 h-9 bg-[var(--color-secondary)] rounded-full flex items-center justify-center text-white font-bold shadow-md">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium max-w-[100px] truncate">
                      {name}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${isMeOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown */}
                  {isMeOpen && (
                    <div className="absolute right-0 top-12 w-56 bg-white text-gray-800 rounded-lg shadow-xl py-2 animate-in slide-in-from-top-2 border border-gray-100">
                      <div className="px-4 py-3 border-b border-gray-100 mb-2 bg-gray-50">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                          Signed in as
                        </p>
                        <p className="text-sm font-bold text-[var(--color-primary)] truncate">
                          {name}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // IF NOT LOGGED IN
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push("/signin")}
                    className="text-white hover:text-[var(--color-secondary)] font-medium transition cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push("/signup")}
                    className="bg-[var(--color-secondary)] text-white px-5 py-2 rounded-lg font-bold hover:brightness-110 transition shadow-md cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* --- MOBILE HAMBURGER --- */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* --- MOBILE MENU --- */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[var(--color-primary)] border-t border-white/10 shadow-xl flex flex-col p-4 gap-2 animate-in slide-in-from-top-5">
            <button
              onClick={() => {
                setIsCreateRoomOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="text-white text-left py-3 px-4 rounded hover:bg-white/10 font-medium cursor-pointer"
            >
              Create Room
            </button>
            <button
              onClick={() => {
                setIsJoinRoomOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="text-white text-left py-3 px-4 rounded hover:bg-white/10 font-medium cursor-pointer"
            >
              Join Room
            </button>

            <div className="h-px bg-white/10 my-2"></div>

            {token ? (
              <button
                onClick={handleLogout}
                className="text-red-300 text-left py-3 px-4 rounded hover:bg-white/10 font-medium flex items-center gap-2 cursor-pointer"
              >
                <LogOut size={18} />
                Logout ({name})
              </button>
            ) : (
              <div className="flex flex-col gap-3 mt-2">
                <button
                  onClick={() => router.push("/signin")}
                  className="w-full py-3 rounded-lg border border-white/30 text-white font-medium hover:bg-white/10 cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push("/signup")}
                  className="w-full py-3 rounded-lg bg-[var(--color-secondary)] text-white font-bold shadow-md cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      <RoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        title="Create a New Room"
        submitAction={handleCreateRoom}
        token={token}
        setRoomName={setRoomName}
        router={router}
      />

      <RoomModal
        isOpen={isJoinRoomOpen}
        onClose={() => setIsJoinRoomOpen(false)}
        title="Join Existing Room"
        submitAction={handleJoinRoom}
        token={token}
        setRoomName={setRoomName}
        router={router}
      />
    </>
  );
};

export default NavBar;

// --- Reusable Modal Component ---
const RoomModal = ({
  isOpen,
  onClose,
  title,
  submitAction,
  token,
  setRoomName,
  router,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitAction: () => void;
  token: string;
  setRoomName: (name: string) => void;
  router: any;
}) => {
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
              onchange={(e) => setRoomName(e.target.value)}
              onkeydown={(e) => e.key === "Enter" && submitAction()}
            />
            <div className="flex justify-end gap-3 mt-2">
              <button
                className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg transition cursor-pointer"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                className="px-6 py-2 bg-[var(--color-secondary)] text-white font-bold rounded-lg hover:brightness-110 transition shadow-md cursor-pointer"
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
                className="px-6 py-2 border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-bold rounded-lg hover:bg-gray-50 transition cursor-pointer"
                onClick={() => {
                  router.push("/signin");
                  onClose();
                }}
              >
                Sign In
              </button>
              <button
                className="text-gray-400 text-sm hover:underline mt-2 cursor-pointer"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
