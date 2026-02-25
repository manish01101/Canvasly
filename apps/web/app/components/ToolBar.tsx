"use client";

import {
  Pencil,
  Circle,
  RectangleHorizontalIcon,
  Eraser,
  Trash2,
  Hand,
  CircleDashed,
  Type,
} from "lucide-react";
import { IconButton } from "./IconButton";
import { Tool } from "../draw/types";

const STROKE_WIDTHS = [
  { value: 2, dotClass: "w-1.5 h-1.5" },
  { value: 6, dotClass: "w-2.5 h-2.5" },
  { value: 12, dotClass: "w-4 h-4" },
  { value: 20, dotClass: "w-6 h-6" },
] as const;

const DRAWING_TOOLS: Tool[] = ["pencil", "rect", "circle", "ellipse", "eraser"];

interface ToolbarProps {
  tool: Tool;
  strokeWidth: number;
  onToolChange: (tool: Tool) => void;
  onStrokeWidthChange: (width: number) => void;
  // extra controls rendered on the right side - leave/chat buttons)
  rightSlot?: React.ReactNode;
}

export function Toolbar({
  tool,
  strokeWidth,
  onToolChange,
  onStrokeWidthChange,
  rightSlot,
}: ToolbarProps) {
  const showStrokeSelector = DRAWING_TOOLS.includes(tool);

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
      {/* Tool Selector */}
      <div className="flex gap-3 bg-gray-900/90 backdrop-blur-sm border border-gray-700 px-4 py-2 rounded-full shadow-xl">
        <IconButton
          activated={tool === "move"}
          onClick={() => onToolChange("move")}
          icon={<Hand className="w-5 h-5" />}
        />
        <IconButton
          activated={tool === "pencil"}
          onClick={() => onToolChange("pencil")}
          icon={<Pencil className="w-5 h-5" />}
        />
        <IconButton
          activated={tool === "text"}
          onClick={() => onToolChange("text")}
          icon={<Type className="w-5 h-5" />}
        />
        <IconButton
          activated={tool === "rect"}
          onClick={() => onToolChange("rect")}
          icon={<RectangleHorizontalIcon className="w-5 h-5" />}
        />
        <IconButton
          activated={tool === "circle"}
          onClick={() => onToolChange("circle")}
          icon={<Circle className="w-5 h-5" />}
        />
        <IconButton
          activated={tool === "ellipse"}
          onClick={() => onToolChange("ellipse")}
          icon={<CircleDashed className="w-5 h-5" />}
        />
        <IconButton
          activated={tool === "eraser"}
          onClick={() => onToolChange("eraser")}
          icon={<Eraser className="w-5 h-5" />}
        />
        <div className="bg-gray-500 w-px" aria-hidden="true" />
        <IconButton
          activated={tool === "delete"}
          onClick={() => onToolChange("delete")}
          icon={<Trash2 className="w-5 h-5" />}
        />

        {/* Right slot-leave button, chat toggle */}
        {rightSlot && (
          <>
            <div className="bg-gray-500 w-px" aria-hidden="true" />
            {rightSlot}
          </>
        )}
      </div>

      {/* Stroke Width Selector */}
      {showStrokeSelector && (
        <div className="flex gap-3 bg-gray-900/90 backdrop-blur-sm border border-gray-700 px-4 py-1 rounded-full shadow-xl animate-in fade-in slide-in-from-top-2">
          {STROKE_WIDTHS.map(({ value, dotClass }) => (
            <button
              key={value}
              onClick={() => onStrokeWidthChange(value)}
              className={`p-2 rounded-full transition-all ${strokeWidth === value ? "bg-blue-600" : "hover:bg-gray-800"}`}
            >
              <div className={`${dotClass} rounded-full bg-white`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
