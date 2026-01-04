"use client";

import React, { useEffect, useRef, useState } from "react";
import { Tool } from "../draw/types";
import {
  Circle,
  CircleDashed,
  Eraser,
  Hand,
  Pencil,
  RectangleHorizontalIcon,
  Trash2,
} from "lucide-react";
import { IconButton } from "../components/IconButton";
import Logo from "../components/Logo";
import { CanvasEngine } from "./CanvasEngine";

const page = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<CanvasEngine | null>(null);
  const [tool, setTool] = useState<Tool>("move");
  const [strokeWidth, setStrokeWidth] = useState<number>(2);

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;
    const g = new CanvasEngine(canvasRef.current);

    setGame(g);
    g.setTool("move");

    return () => {
      g.destroy();
    };
  }, []);

  // Update Tool
  useEffect(() => {
    game?.setTool(tool);
  }, [tool, game]);

  // Update Stroke Width
  useEffect(() => {
    game?.setStrokeWidth(strokeWidth);
  }, [strokeWidth, game]);

  return (
    <>
      <div className="fixed top-4 left-4 z-50 select-none">
        <Logo />
      </div>

      <div className="relative w-full h-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="block bg-black touch-none"
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Top Center Toolbar */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
          {/* Tool Selector */}
          <div className="flex gap-3 bg-gray-900/90 backdrop-blur-sm border border-gray-700 px-4 py-2 rounded-full shadow-xl">
            <IconButton
              activated={tool === "move"}
              onClick={() => setTool("move")}
              icon={<Hand className="w-5 h-5" />}
            />
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
              activated={tool === "ellipse"}
              onClick={() => setTool("ellipse")}
              icon={<CircleDashed className="w-5 h-5" />}
            />
            <IconButton
              activated={tool === "eraser"}
              onClick={() => setTool("eraser")}
              icon={<Eraser className="w-5 h-5" />}
            />
            <div className="bg-gray-500 w-px" aria-hidden="true"></div>
            <IconButton
              activated={tool === "delete"}
              onClick={() => setTool("delete")}
              icon={<Trash2 className="w-5 h-5" />}
            />
          </div>

          {/* Stroke Width Selector (Only show for drawing tools) */}
          {(tool === "pencil" ||
            tool === "rect" ||
            tool === "circle" ||
            tool === "ellipse" ||
            tool === "eraser") && (
            <div className="flex gap-3 bg-gray-900/90 backdrop-blur-sm border border-gray-700 px-4 py-1 rounded-full shadow-xl animate-in fade-in slide-in-from-top-2">
              <button
                onClick={() => setStrokeWidth(2)}
                className={`p-2 rounded-full transition-all ${strokeWidth === 2 ? "bg-blue-600" : "hover:bg-gray-800"}`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </button>
              <button
                onClick={() => setStrokeWidth(6)}
                className={`p-2 rounded-full transition-all ${strokeWidth === 6 ? "bg-blue-600" : "hover:bg-gray-800"}`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
              </button>
              <button
                onClick={() => setStrokeWidth(12)}
                className={`p-2 rounded-full transition-all ${strokeWidth === 12 ? "bg-blue-600" : "hover:bg-gray-800"}`}
              >
                <div className="w-4 h-4 rounded-full bg-white" />
              </button>
              <button
                onClick={() => setStrokeWidth(20)}
                className={`p-2 rounded-full transition-all ${strokeWidth === 20 ? "bg-blue-600" : "hover:bg-gray-800"}`}
              >
                <div className="w-6 h-6 rounded-full bg-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default page;
