export type Point = { x: number; y: number };

export type Tool =
  | "rect"
  | "circle"
  | "ellipse"
  | "pencil"
  | "eraser"
  | "delete"
  | "move"
  | "text";

export type Shape = {
  id: string;
  type: "rect" | "circle" | "ellipse" | "pencil" | "eraser" | "text";
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  centerX?: number;
  centerY?: number;
  radius?: number;
  radiusX?: number;
  radiusY?: number;
  points?: Point[];
  color?: string;
  strokeWidth?: number;
  text?: string;
  fontSize?: number;
};
