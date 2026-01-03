export type Point = { x: number; y: number };

export type Tool = "rect" | "circle" | "pencil" | "eraser" | "delete";

export type Shape = {
  id: string;
  type: "rect" | "circle" | "pencil" | "eraser";
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  centerX?: number;
  centerY?: number;
  radius?: number;
  points?: Point[];
  color?: string;
};
