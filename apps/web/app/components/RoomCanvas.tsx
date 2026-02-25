"use client";

import { useEffect, useRef, useState } from "react";
import { Tool, Shape } from "../draw/types";
import { WebSocketSyncAdapter } from "../draw/sync/WebSocketSyncAdapter";
import { CanvasEngine } from "../draw/engine/CanvasEngine";
import { Toolbar } from "./ToolBar";

export function RoomCanvas({
  roomId,
  socket,
  initialShapes,
}: {
  roomId: string;
  socket: WebSocket;
  initialShapes: Shape[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);
  const initialShapesRef = useRef<Shape[]>(initialShapes);

  const [tool, setTool] = useState<Tool>("move");
  const [strokeWidth, setStrokeWidth] = useState(2);

  // keep ref in sync with prop
  useEffect(() => {
    initialShapesRef.current = initialShapes;
  }, [initialShapes]);

  // boot engine
  useEffect(() => {
    if (!canvasRef.current) return;

    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;

    const sync = new WebSocketSyncAdapter(socket, roomId);
    const engine = new CanvasEngine(
      canvasRef.current,
      sync,
      initialShapesRef.current,
    );
    engine.setTool("move");
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [socket, roomId]);

  // tool and strokewidth will not restart the engine
  useEffect(() => {
    engineRef.current?.setTool(tool);
  }, [tool]);

  useEffect(() => {
    engineRef.current?.setStrokeWidth(strokeWidth);
  }, [strokeWidth]);

  // resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !engineRef.current) return;
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      engineRef.current.redraw();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Escape key
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
      />
    </div>
  );
}
