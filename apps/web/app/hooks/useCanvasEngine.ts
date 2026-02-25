import { useEffect, useRef } from "react";
import { Tool, Shape } from "../draw/types";
import { ISyncAdapter } from "../draw/sync/ISyncAdapter";
import { CanvasEngine } from "../draw/engine/CanvasEngine";

interface UseCanvasEngineOptions {
  sync: ISyncAdapter | null;
  initialShapes: Shape[];
  tool: Tool;
  strokeWidth: number;
}

export function useCanvasEngine({
  sync,
  initialShapes,
  tool,
  strokeWidth,
}: UseCanvasEngineOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);

  // Keep a ref to initialShapes so the boot effect always gets the latest value without re-running
  const initialShapesRef = useRef<Shape[]>(initialShapes);
  useEffect(() => {
    initialShapesRef.current = initialShapes;
  }, [initialShapes]);

  // Boot — only runs when sync becomes available (once)
  useEffect(() => {
    if (!canvasRef.current || !sync) return;

    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;

    const instance = new CanvasEngine(
      canvasRef.current,
      sync,
      initialShapesRef.current,
    );
    instance.setTool("move");
    engineRef.current = instance;

    return () => {
      instance.destroy();
      engineRef.current = null;
    };
  }, [sync]);

  // Tool change — never recreates engine
  useEffect(() => {
    engineRef.current?.setTool(tool);
  }, [tool]);

  // Stroke width change — never recreates engine
  useEffect(() => {
    engineRef.current?.setStrokeWidth(strokeWidth);
  }, [strokeWidth]);

  // Resize
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

  return { canvasRef };
}
