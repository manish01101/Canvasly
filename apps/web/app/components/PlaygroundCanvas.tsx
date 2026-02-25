"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Tool } from "../draw/types";
import { LocalStorageSyncAdapter } from "../draw/sync/LocalStorageSyncAdapter";
import { useCanvasEngine } from "../hooks/useCanvasEngine";
import { Toolbar } from "./ToolBar";

export function PlaygroundCanvas() {
  const router = useRouter();
  const [tool, setTool] = useState<Tool>("move");
  const [strokeWidth, setStrokeWidth] = useState(2);

  const { sync, initialShapes } = useMemo(() => {
    const adapter = new LocalStorageSyncAdapter();
    return { sync: adapter, initialShapes: adapter.load() };
  }, []);

  const { canvasRef } = useCanvasEngine({
    sync,
    initialShapes,
    tool,
    strokeWidth,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTool("move");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block bg-black touch-none"
        onContextMenu={(e) => e.preventDefault()}
      />
      <Toolbar
        tool={tool}
        strokeWidth={strokeWidth}
        onToolChange={setTool}
        onStrokeWidthChange={setStrokeWidth}
        rightSlot={
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-full hover:bg-red-600 transition-all text-white"
            title="Leave"
          >
            <LogOut className="w-5 h-5" />
          </button>
        }
      />
    </div>
  );
}
