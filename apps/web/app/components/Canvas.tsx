"use client";

import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import {
  Pencil,
  Circle,
  RectangleHorizontalIcon,
  Eraser,
  Trash2,
} from "lucide-react";
import { Game, Tool } from "../draw";

export function Canvas({
  roomId,
  socket,
  initialShapes,
}: {
  roomId: string;
  socket: WebSocket;
  initialShapes: any[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [tool, setTool] = useState<Tool>("rect");

  useEffect(() => {
    if (!canvasRef.current) return;
    const g = new Game(canvasRef.current, roomId, socket, initialShapes);
    setGame(g);
    return () => g.destroy();
  }, [roomId, socket, initialShapes]);

  useEffect(() => {
    game?.setTool(tool);
  }, [tool, game]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className={`block bg-black touch-none ${
          tool === "delete" ? "cursor-crosshair" : "cursor-default"
        }`}
      />

      {/* Floating Toolbar - Top Center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="flex gap-3 bg-gray-900/90 backdrop-blur-sm border border-gray-700 px-4 py-2 rounded-full shadow-xl">
          <IconButton
            activated={tool === "pencil"}
            onClick={() => setTool("pencil")}
            icon={<Pencil className="w-5 h-5" />}
          />
          <IconButton
            activated={tool === "rect"}
            onClick={() => setTool("rect")}
            icon={<RectangleHorizontalIcon className="w-5 h-5" />}
          />
          <IconButton
            activated={tool === "circle"}
            onClick={() => setTool("circle")}
            icon={<Circle className="w-5 h-5" />}
          />
          <IconButton
            activated={tool === "eraser"}
            onClick={() => setTool("eraser")}
            icon={<Eraser className="w-5 h-5" />}
          />
          <IconButton
            activated={tool === "delete"}
            onClick={() => setTool("delete")}
            icon={<Trash2 className="w-5 h-5" />}
          />
        </div>
      </div>
    </div>
  );
}
