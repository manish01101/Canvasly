import Link from "next/link";
import React from "react";
import { Shapes } from "lucide-react"; // Make sure you have this installed
import Logo from "../components/Logo";

const CanvasLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen w-screen bg-black text-white overflow-hidden relative">
      {/* Logo Overlay - Top Left */}
      <div className="fixed top-4 left-4 z-50 select-none">
        <Logo />
      </div>

      {/* Main Canvas Area */}
      <main className="h-full w-full">{children}</main>
    </div>
  );
};

export default CanvasLayout;
