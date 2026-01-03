import { Point, Shape, Tool } from "./types";
import { isPointInShape } from "./utils";

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private shapes: Shape[] = [];
  private tool: Tool = "rect";

  private drawing = false;
  private startX = 0;
  private startY = 0;
  // private pencilPoints: Point[] = [];
  private currentPoints: Point[] = [];
  private socketHandler: (e: MessageEvent) => void;

  constructor(
    canvas: HTMLCanvasElement,
    private roomId: string,
    private socket: WebSocket,
    initialShapes: Shape[]
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.shapes = initialShapes || [];
    this.socketHandler = this.handleSocketMessage.bind(this);
    this.bindMouse();
    this.initSocket();

    // Initial draw
    requestAnimationFrame(() => this.redraw());
  }

  setTool(tool: Tool) {
    this.tool = tool;
  }

  private handleSocketMessage(e: MessageEvent) {
    const data = JSON.parse(e.data);

    if (data.type === "draw" && data.shape) {
      const exists = this.shapes.some((s) => s.id === data.shape.id);
      if (!exists) {
        this.shapes.push(data.shape);
        this.redraw();
      }
    }

    if (data.type === "delete_shape") {
      this.shapes = this.shapes.filter((s) => s.id !== data.shapeId);
      this.redraw();
    }
  }
  private initSocket() {
    this.socket.addEventListener("message", this.socketHandler);
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.onDown);
    this.canvas.removeEventListener("mousemove", this.onMove);
    this.canvas.removeEventListener("mouseup", this.onUp);
    this.socket.removeEventListener("message", this.socketHandler);
  }

  private getPos(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();

    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  private redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (const s of this.shapes) {
      if (s.type === "rect") {
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(s.x ?? 0, s.y ?? 0, s.width ?? 0, s.height ?? 0);
      } else if (s.type === "circle") {
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(
          s.centerX ?? 0,
          s.centerY ?? 0,
          s.radius ?? 0,
          0,
          Math.PI * 2
        );
        this.ctx.stroke();
      }

      // Logic for Pencil/Eraser
      else if (s.type === "pencil" || s.type === "eraser") {
        this.ctx.beginPath();
        if (s.type === "eraser") {
          this.ctx.strokeStyle = "black";
          this.ctx.lineWidth = 15;
        } else {
          this.ctx.strokeStyle = "white";
          this.ctx.lineWidth = 2;
        }
        if (s.points && s.points.length > 0 && s.points[0]) {
          this.ctx.moveTo(s.points[0].x, s.points[0].y);
          s.points.forEach((p) => this.ctx.lineTo(p.x, p.y));
          this.ctx.stroke();
        }
      }
    }
  }

  private onDown = (e: MouseEvent) => {
    this.drawing = true;
    const { x, y } = this.getPos(e);
    this.startX = x;
    this.startY = y;

    if (this.tool === "delete") {
      // Find top-most shape clicked
      const clickedShape = [...this.shapes]
        .reverse()
        .find((s) => isPointInShape(s, x, y));

      if (clickedShape) {
        // remove shapes locally
        this.shapes = this.shapes.filter((s) => s.id !== clickedShape.id);
        this.redraw();
        // tell backend to delete it
        this.socket.send(
          JSON.stringify({
            type: "delete_shape",
            roomId: this.roomId,
            shapeId: clickedShape.id,
          })
        );
      }
      return;
    }

    if (this.tool === "pencil" || this.tool === "eraser") {
      this.currentPoints = [{ x, y }];
    }
  };

  private onMove = (e: MouseEvent) => {
    if (!this.drawing) return;
    if (this.tool === "delete") return;
    const { x, y } = this.getPos(e);

    if (this.tool === "pencil" || this.tool === "eraser") {
      this.currentPoints.push({ x, y });

      // Optimization: just draw the new line segment here
      // instead of redrawing everything, but redraw is safer for syncing.
      this.redraw();

      // Draw the CURRENT stroke live
      this.ctx.beginPath();

      if (this.tool === "eraser") {
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 15;
      } else {
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 2;
      }
      if (this.currentPoints[0]) {
        this.ctx.moveTo(this.currentPoints[0].x, this.currentPoints[0].y);
      }
      this.currentPoints.forEach((p) => this.ctx.lineTo(p.x, p.y));
      this.ctx.stroke();
      return;
    }

    const w = x - this.startX;
    const h = y - this.startY;

    this.redraw(); // Clear and draw old shapes

    this.ctx.strokeStyle = "white"; // Reset style for previews
    this.ctx.lineWidth = 2;

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

    if (this.tool === "delete") return;

    const { x, y } = this.getPos(e);
    const w = x - this.startX;
    const h = y - this.startY;

    let shape: Shape | null = null;
    const shapeId = crypto.randomUUID();

    if (this.tool === "pencil") {
      shape = { id: shapeId, type: "pencil", points: [...this.currentPoints] };
    } else if (this.tool === "eraser") {
      shape = { id: shapeId, type: "eraser", points: [...this.currentPoints] };
    } else if (this.tool === "rect") {
      shape = {
        id: shapeId,
        type: "rect",
        x: w < 0 ? x : this.startX, // If dragged left, new X is current mouse pos
        y: h < 0 ? y : this.startY, // If dragged up, new Y is current mouse pos
        width: Math.abs(w), // Always positive
        height: Math.abs(h),
      };
    } else if (this.tool === "circle") {
      const r = Math.max(Math.abs(w), Math.abs(h)) / 2;
      shape = {
        id: shapeId,
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
