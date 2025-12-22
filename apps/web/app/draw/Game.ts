import { Tool } from "../components/Canvas";
import { Point, Shape } from "./types";

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private shapes: Shape[] = [];
  private tool: Tool = "rect";

  private drawing = false;
  private startX = 0;
  private startY = 0;
  private pencilPoints: Point[] = [];

  constructor(
    canvas: HTMLCanvasElement,
    private roomId: string,
    private socket: WebSocket,
    initialShapes: Shape[]
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    // Ensure we don't crash if shapes are null
    this.shapes = initialShapes || [];

    this.bindMouse();
    this.listenSocket();

    // Initial draw
    requestAnimationFrame(() => this.redraw());
  }

  setTool(tool: Tool) {
    this.tool = tool;
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.onDown);
    this.canvas.removeEventListener("mousemove", this.onMove);
    this.canvas.removeEventListener("mouseup", this.onUp);
  }

  private getPos(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 2;

    for (const s of this.shapes) {
      if (s.type === "rect") {
        this.ctx.strokeRect(s.x, s.y, s.width, s.height);
      } else if (s.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(s.centerX, s.centerY, s.radius, 0, Math.PI * 2);
        this.ctx.stroke();
      } else if (s.type === "pencil") {
        this.ctx.beginPath();
        if (s.points && s.points.length > 0 && s.points[0]) {
          this.ctx.moveTo(s.points[0].x, s.points[0].y);
          s.points.forEach((p) => this.ctx.lineTo(p.x, p.y));
          this.ctx.stroke();
        }
      }
    }
  }

  private listenSocket() {
    this.socket.addEventListener("message", (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "draw" && data.shape) {
        this.shapes.push(data.shape);
        this.redraw();
      }
    });
  }

  private onDown = (e: MouseEvent) => {
    this.drawing = true;
    const { x, y } = this.getPos(e);
    this.startX = x;
    this.startY = y;

    if (this.tool === "pencil") {
      this.pencilPoints = [{ x, y }];
    }
  };

  private onMove = (e: MouseEvent) => {
    if (!this.drawing) return;
    const { x, y } = this.getPos(e);

    if (this.tool === "pencil") {
      this.pencilPoints.push({ x, y });

      // Optimization: You could just draw the new line segment here
      // instead of redrawing everything, but redraw is safer for syncing.
      this.redraw();

      // Draw the CURRENT stroke live
      this.ctx.beginPath();
      if (this.pencilPoints[0]) {
        this.ctx.moveTo(this.pencilPoints[0].x, this.pencilPoints[0].y);
      }
      this.pencilPoints.forEach((p) => this.ctx.lineTo(p.x, p.y));
      this.ctx.stroke();
      return;
    }

    const w = x - this.startX;
    const h = y - this.startY;

    this.redraw(); // Clear and draw old shapes

    // Draw preview of current shape
    if (this.tool === "rect") {
      this.ctx.strokeRect(this.startX, this.startY, w, h);
    }

    if (this.tool === "circle") {
      const r = Math.max(Math.abs(w), Math.abs(h)) / 2;
      this.ctx.beginPath();
      this.ctx.arc(this.startX + w / 2, this.startY + h / 2, r, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  };

  private onUp = (e: MouseEvent) => {
    if (!this.drawing) return;
    this.drawing = false;

    const { x, y } = this.getPos(e);
    const w = x - this.startX;
    const h = y - this.startY;

    let shape: Shape | null = null;

    if (this.tool === "pencil") {
      shape = { type: "pencil", points: [...this.pencilPoints] };
    } else if (this.tool === "rect") {
      shape = {
        type: "rect",
        x: this.startX,
        y: this.startY,
        width: w,
        height: h,
      };
    } else if (this.tool === "circle") {
      const r = Math.max(Math.abs(w), Math.abs(h)) / 2;
      shape = {
        type: "circle",
        radius: r,
        centerX: this.startX + w / 2,
        centerY: this.startY + h / 2,
      };
    }

    if (shape) {
      this.shapes.push(shape);

      this.socket.send(
        JSON.stringify({
          type: "draw",
          roomId: this.roomId,
          shape,
        })
      );

      this.redraw();
    }
  };

  private bindMouse() {
    this.canvas.addEventListener("mousedown", this.onDown);
    this.canvas.addEventListener("mousemove", this.onMove);
    this.canvas.addEventListener("mouseup", this.onUp);
  }
}
