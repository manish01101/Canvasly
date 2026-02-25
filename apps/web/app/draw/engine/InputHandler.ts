import { Tool, Point } from "../types";
import { CameraController } from "./CameraController";

export type InputCallbacks = {
  onPanStart: () => void;
  onPanMove: (dx: number, dy: number) => void;
  onPanEnd: () => void;
  onDrawStart: (worldX: number, worldY: number) => void;
  onDrawMove: (worldX: number, worldY: number) => void;
  onDrawEnd: (worldX: number, worldY: number) => void;
  onDeleteAt: (worldX: number, worldY: number) => void;
  onTextAt: (worldX: number, worldY: number) => void;
  onZoom: (deltaY: number, mouseX: number, mouseY: number) => void;
  onSpaceChange: (pressed: boolean) => void;
};

export class InputHandler {
  private drawing = false;
  private isPanning = false;
  private spacePressed = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private tool: Tool = "move";

  constructor(
    private canvas: HTMLCanvasElement,
    private camera: CameraController,
    private callbacks: InputCallbacks,
  ) {
    this.bind();
  }

  setTool(tool: Tool) {
    this.tool = tool;
  }

  private getWorldPos(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    return this.camera.toWorld(e.clientX - rect.left, e.clientY - rect.top);
  }

  private shouldPan(e: MouseEvent) {
    return this.tool === "move" || e.button === 1 || this.spacePressed;
  }

  private onDown = (e: MouseEvent) => {
    e.preventDefault();
    if (this.shouldPan(e)) {
      this.isPanning = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.callbacks.onPanStart();
      return;
    }

    const { x, y } = this.getWorldPos(e);
    if (this.tool === "text") {
      this.callbacks.onTextAt(x, y);
      return;
    }
    if (this.tool === "delete") {
      this.callbacks.onDeleteAt(x, y);
      return;
    }

    this.drawing = true;
    this.callbacks.onDrawStart(x, y);
  };

  private onMove = (e: MouseEvent) => {
    if (this.isPanning) {
      this.callbacks.onPanMove(
        e.clientX - this.lastMouseX,
        e.clientY - this.lastMouseY,
      );
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      return;
    }
    if (!this.drawing) return;
    const { x, y } = this.getWorldPos(e);
    this.callbacks.onDrawMove(x, y);
  };

  private onUp = (e: MouseEvent) => {
    if (this.isPanning) {
      this.isPanning = false;
      this.callbacks.onPanEnd();
      return;
    }
    if (!this.drawing) return;
    this.drawing = false;
    const { x, y } = this.getWorldPos(e);
    this.callbacks.onDrawEnd(x, y);
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    this.callbacks.onZoom(
      e.deltaY,
      e.clientX - rect.left,
      e.clientY - rect.top,
    );
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.code === "Space" && !this.spacePressed) {
      this.spacePressed = true;
      this.callbacks.onSpaceChange(true);
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.code === "Space") {
      this.spacePressed = false;
      this.callbacks.onSpaceChange(false);
    }
  };

  private bind() {
    this.canvas.addEventListener("mousedown", this.onDown);
    this.canvas.addEventListener("mousemove", this.onMove);
    this.canvas.addEventListener("mouseup", this.onUp);
    this.canvas.addEventListener("wheel", this.onWheel, { passive: false });
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  dispose() {
    this.canvas.removeEventListener("mousedown", this.onDown);
    this.canvas.removeEventListener("mousemove", this.onMove);
    this.canvas.removeEventListener("mouseup", this.onUp);
    this.canvas.removeEventListener("wheel", this.onWheel);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
}
