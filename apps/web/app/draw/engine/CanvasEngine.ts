import { Shape, Tool, Point } from "../types";
import { ISyncAdapter } from "../sync/ISyncAdapter";
import { CameraController } from "./CameraController";
import { ShapeManager } from "./ShapeManager";
import { CanvasRenderer } from "./CanvasRenderer";
import { InputHandler } from "./InputHandler";
import { TextInputController } from "./TextInputController";
import { isPointInShape } from "../utils";
import { LocalStorageSyncAdapter } from "../sync/LocalStorageSyncAdapter";

export class CanvasEngine {
  private camera: CameraController;
  private shapes: ShapeManager;
  private renderer: CanvasRenderer;
  private input: InputHandler;
  private textInput: TextInputController;

  private currentTool: Tool = "move";
  private strokeWidth = 2;
  private fontSize = 20;

  // Live drawing state
  private drawStart = { x: 0, y: 0 };
  private currentPoints: Point[] = [];

  constructor(
    private canvas: HTMLCanvasElement,
    private sync: ISyncAdapter,
    initialShapes: Shape[] = [],
  ) {
    this.camera = new CameraController();
    this.shapes = new ShapeManager();
    this.renderer = new CanvasRenderer(canvas);
    this.textInput = new TextInputController();

    this.shapes.load(initialShapes);

    this.input = new InputHandler(canvas, this.camera, {
      onPanStart: () => this.updateCursor(),
      onPanMove: (dx, dy) => {
        this.camera.pan(dx, dy);
        this.redraw();
      },
      onPanEnd: () => this.updateCursor(),
      onDrawStart: (x, y) => this.handleDrawStart(x, y),
      onDrawMove: (x, y) => this.handleDrawMove(x, y),
      onDrawEnd: (x, y) => this.handleDrawEnd(x, y),
      onDeleteAt: (x, y) => this.handleDelete(x, y),
      onTextAt: (x, y) => this.handleText(x, y),
      onZoom: (dy, mx, my) => {
        this.camera.zoomAt(dy, mx, my);
        this.redraw();
      },
      onSpaceChange: () => this.updateCursor(),
    });

    this.sync.subscribe({
      onRemoteShapeAdded: (shape) => {
        this.shapes.add(shape);
        this.redraw();
      },
      onRemoteShapeDeleted: (id) => {
        this.shapes.remove(id);
        this.redraw();
      },
    });

    // localStorage adapter access to live shapes
    if ("bindShapeSource" in sync) {
      (sync as LocalStorageSyncAdapter).bindShapeSource(() =>
        this.shapes.snapshot(),
      );
    }

    this.redraw();
  }

  // --- Public API ---

  getShapes(): Shape[] {
    return this.shapes.snapshot();
  }

  setTool(tool: Tool) {
    this.currentTool = tool;
    this.input.setTool(tool);
    this.updateCursor();
  }

  setStrokeWidth(width: number) {
    this.strokeWidth = width;
  }

  redraw() {
    this.renderer.render(this.shapes.getAll(), this.camera.getCamera());
  }

  destroy() {
    this.input.dispose();
    this.sync.dispose();
  }

  // --- Private handlers ---

  private handleDrawStart(x: number, y: number) {
    this.drawStart = { x, y };
    if (this.currentTool === "pencil" || this.currentTool === "eraser") {
      this.currentPoints = [{ x, y }];
    }
  }

  private handleDrawMove(x: number, y: number) {
    const cam = this.camera.getCamera();

    if (this.currentTool === "pencil" || this.currentTool === "eraser") {
      this.currentPoints.push({ x, y });
      this.redraw();
      this.renderer.renderOverlay((ctx) => {
        ctx.beginPath();
        ctx.strokeStyle = this.currentTool === "eraser" ? "black" : "white";
        ctx.lineWidth = Math.max(this.strokeWidth, 1 / cam.zoom);
        const [p0, ...rest] = this.currentPoints;
        if (p0) {
          ctx.moveTo(p0.x, p0.y);
          rest.forEach((p) => ctx.lineTo(p.x, p.y));
        }
        ctx.stroke();
      }, cam);
      return;
    }

    const w = x - this.drawStart.x;
    const h = y - this.drawStart.y;
    this.redraw();
    this.renderer.renderOverlay((ctx) => {
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = Math.max(this.strokeWidth, 1 / cam.zoom);
      if (this.currentTool === "rect") {
        ctx.strokeRect(this.drawStart.x, this.drawStart.y, w, h);
      } else if (this.currentTool === "circle") {
        const r = Math.max(Math.abs(w), Math.abs(h)) / 2;
        ctx.beginPath();
        ctx.arc(
          this.drawStart.x + w / 2,
          this.drawStart.y + h / 2,
          r,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      } else if (this.currentTool === "ellipse") {
        ctx.beginPath();
        ctx.ellipse(
          this.drawStart.x + w / 2,
          this.drawStart.y + h / 2,
          Math.abs(w) / 2,
          Math.abs(h) / 2,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
    }, cam);
  }

  private handleDrawEnd(x: number, y: number) {
    const { x: sx, y: sy } = this.drawStart;
    const w = x - sx;
    const h = y - sy;
    const id = crypto.randomUUID();
    let shape: Shape | null = null;

    switch (this.currentTool) {
      case "rect":
        shape = {
          id,
          type: "rect",
          x: w < 0 ? x : sx,
          y: h < 0 ? y : sy,
          width: Math.abs(w),
          height: Math.abs(h),
          strokeWidth: this.strokeWidth,
        };
        break;
      case "circle":
        const r = Math.max(Math.abs(w), Math.abs(h)) / 2;
        shape = {
          id,
          type: "circle",
          radius: r,
          centerX: sx + w / 2,
          centerY: sy + h / 2,
          strokeWidth: this.strokeWidth,
        };
        break;
      case "ellipse":
        shape = {
          id,
          type: "ellipse",
          radiusX: Math.abs(w) / 2,
          radiusY: Math.abs(h) / 2,
          centerX: sx + w / 2,
          centerY: sy + h / 2,
          strokeWidth: this.strokeWidth,
        };
        break;
      case "pencil":
        shape = {
          id,
          type: "pencil",
          points: [...this.currentPoints],
          strokeWidth: this.strokeWidth,
        };
        break;
      case "eraser":
        shape = {
          id,
          type: "eraser",
          points: [...this.currentPoints],
          strokeWidth: this.strokeWidth,
        };
        break;
    }

    if (shape) {
      this.shapes.add(shape);
      this.sync.onShapeCreated(shape);
      this.redraw();
    }
  }

  private handleDelete(x: number, y: number) {
    const hit = [...this.shapes.getAll()]
      .reverse()
      .find((s) => isPointInShape(s, x, y));
    if (hit) {
      this.shapes.remove(hit.id);
      this.sync.onShapeDeleted(hit.id);
      this.redraw();
    }
  }

  private handleText(x: number, y: number) {
    this.textInput.open(
      x,
      y,
      this.fontSize,
      this.camera.getCamera(),
      this.canvas.getBoundingClientRect(),
      (shape) => {
        this.shapes.add(shape);
        this.sync.onShapeCreated(shape);
        this.redraw();
      },
    );
  }

  private updateCursor() {
    const cursors: Partial<Record<Tool, string>> = {
      move: "grab",
      delete: "crosshair",
      eraser: "crosshair",
      text: "text",
    };
    this.canvas.style.cursor = cursors[this.currentTool] ?? "default";
  }
}
