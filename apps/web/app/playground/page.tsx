"use client";

import Logo from "../components/Logo";
import { PlaygroundCanvas } from "../components/PlaygroundCanvas";

export default function PlaygroundPage() {
  return (
    <div className="h-screen w-screen bg-black overflow-hidden">
      <div className="fixed top-4 left-4 z-50 select-none">
        <Logo />
      </div>
      <div className="w-full h-full">
        <PlaygroundCanvas />
      </div>
    </div>
  );
}
