"use client";

import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Pencil, Circle, RectangleHorizontalIcon } from "lucide-react";
import { Game } from "../draw";

export type Tool = "rect" | "circle" | "pencil";

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
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="block bg-black"
      />

      <div className="fixed top-4 left-4 flex gap-2 bg-gray-900 p-2 rounded">
        <IconButton
          activated={tool === "pencil"}
          onClick={() => setTool("pencil")}
          icon={<Pencil />}
        />
        <IconButton
          activated={tool === "rect"}
          onClick={() => setTool("rect")}
          icon={<RectangleHorizontalIcon />}
        />
        <IconButton
          activated={tool === "circle"}
          onClick={() => setTool("circle")}
          icon={<Circle />}
        />
      </div>
    </div>
  );
}
