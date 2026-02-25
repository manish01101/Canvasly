"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";

interface UserMenuProps {
  name: string;
  onLogout: () => void;
}

export function UserMenu({ name, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:opacity-90 transition"
      >
        <div className="w-9 h-9 bg-[var(--color-secondary)] rounded-full flex items-center justify-center text-white font-bold shadow-md">
          {name.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium max-w-[100px] truncate">{name}</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
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
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition flex items-center gap-2"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
