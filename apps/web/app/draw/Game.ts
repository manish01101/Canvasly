import { Point, Shape, Tool } from "./types";
import { isPointInShape } from "./utils";

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private shapes: Shape[] = [];
  private tool: Tool = "move";
  private currentStrokeWidth = 2;

  private drawing = false;
  private startX = 0;
  private startY = 0;
  private currentPoints: Point[] = [];
  private socketHandler: (e: MessageEvent) => void;

  private camera = { x: 0, y: 0, zoom: 1 };
  private isPanning = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private spacePressed = false;

  private textInput: HTMLDivElement | null = null;
  private currentFontSize = 20;

  constructor(
    canvas: HTMLCanvasElement,
    private roomId: string,
    private socket: WebSocket,
    initialShapes: Shape[],
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.shapes = initialShapes || [];
    this.socketHandler = this.handleSocketMessage.bind(this);

    this.initSocket();
    this.bindMouse();

    requestAnimationFrame(() => this.redraw());
  }

  setTool(tool: Tool) {
    this.tool = tool;
    this.updateCursor();
  }

  setStrokeWidth(width: number) {
    this.currentStrokeWidth = width;
  }

  private handleSocketMessage(e: MessageEvent) {
    const data = JSON.parse(e.data);
    if (data.type === "draw" && data.shape) {
      // console.log("received shape:", data.shape);
      // console.log("stroke width:", data.shape.strokeWidth);
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
    this.canvas.removeEventListener("wheel", this.onWheel);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.socket.removeEventListener("message", this.socketHandler);
  }

  // --- COORDINATE SYSTEMS ---

  private getPos(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    return {
      x: (screenX - this.camera.x) / this.camera.zoom,
      y: (screenY - this.camera.y) / this.camera.zoom,
    };
  }

  // --- DRAWING LOGIC ---

  public redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();

    this.ctx.translate(this.camera.x, this.camera.y);
    this.ctx.scale(this.camera.zoom, this.camera.zoom);

    for (const s of this.shapes) {
      // 1. Set Style
      if (s.type === "eraser") {
        this.ctx.strokeStyle = "black";
      } else {
        this.ctx.strokeStyle = "white";
      }

      // 2. Set Width
      const shapeWidth = s.strokeWidth || 2;
      this.ctx.lineWidth = Math.max(shapeWidth, 1 / this.camera.zoom);

      // 3. Draw
      this.ctx.beginPath();

      if (s.type === "rect") {
        this.ctx.strokeRect(s.x ?? 0, s.y ?? 0, s.width ?? 0, s.height ?? 0);
      } else if (s.type === "circle") {
        this.ctx.arc(
          s.centerX ?? 0,
          s.centerY ?? 0,
          s.radius ?? 0,
          0,
          Math.PI * 2,
        );
        this.ctx.stroke();
      } else if (s.type === "ellipse") {
        const rx = s.radiusX ?? s.radius ?? 0;
        const ry = s.radiusY ?? s.radius ?? 0;
        this.ctx.ellipse(
          s.centerX ?? 0,
          s.centerY ?? 0,
          rx,
          ry,
          0, // rotation
          0,
          Math.PI * 2,
        );
        this.ctx.stroke();
      } else if (s.type === "pencil" || s.type === "eraser") {
        if (s.points && s.points.length > 0) {
          const p0 = s.points[0];
          if (p0) this.ctx.moveTo(p0.x, p0.y);

          for (let i = 1; i < s.points.length; i++) {
            const p = s.points[i];
            if (p) this.ctx.lineTo(p.x, p.y);
          }
          this.ctx.stroke();
        }
      } else if (s.type === "text") {
        const fontSize = s.fontSize || 20;
        const x = s.x ?? 0;
        let yOffset = s.y ?? 0;
        const maxWidth = 400;
        const lineHeight = fontSize * 1.2;

        this.ctx.font = `${fontSize}px sans-serif`;
        this.ctx.fillStyle = "white";
        this.ctx.textBaseline = "top";

        // 1. handle manual newlines (\n) first
        const paragraphs = (s.text || "").split("\n");

        paragraphs.forEach((paragraph) => {
          const words = paragraph.split(" ");
          let currentLine = "";

          // 2. handle automatic wrapping for long lines
          for (let n = 0; n < words.length; n++) {
            const testLine = currentLine + words[n] + " ";
            const metrics = this.ctx.measureText(testLine);

            if (metrics.width > maxWidth && n > 0) {
              this.ctx.fillText(currentLine, x, yOffset);
              currentLine = words[n] + " ";
              yOffset += lineHeight;
            } else {
              currentLine = testLine;
            }
          }
          // draw remainder of paragraph
          this.ctx.fillText(currentLine, x, yOffset);
          yOffset += lineHeight;
        });
      }

      // console.log("rendering shape:", s);
    }
    this.ctx.restore();
  }

  // --- EVENT HANDLERS ---

  private onDown = (e: MouseEvent) => {
    e.preventDefault();
    const isMiddleClick = e.button === 1;
    if (this.tool === "move" || isMiddleClick || this.spacePressed) {
      this.isPanning = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.canvas.style.cursor = "grabbing";
      return;
    }

    const { x, y } = this.getPos(e);

    if (this.tool === "text") {
      this.createTextInput(x, y);
      return;
    }

    this.drawing = true;
    this.startX = x;
    this.startY = y;

    if (this.tool === "delete") {
      const clickedShape = [...this.shapes]
        .reverse()
        .find((s) => isPointInShape(s, x, y));
      if (clickedShape) {
        this.shapes = this.shapes.filter((s) => s.id !== clickedShape.id);
        this.redraw();
        this.socket.send(
          JSON.stringify({
            type: "delete_shape",
            roomId: this.roomId,
            shapeId: clickedShape.id,
          }),
        );
      }
      return;
    }

    if (this.tool === "pencil" || this.tool === "eraser") {
      this.currentPoints = [{ x, y }];
    }
  };

  private onMove = (e: MouseEvent) => {
    if (this.isPanning) {
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.camera.x += dx;
      this.camera.y += dy;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.redraw();
      return;
    }

    if (!this.drawing) return;
    if (this.tool === "delete" || this.tool === "move") return;

    const { x, y } = this.getPos(e);

    // Pencil / Eraser Trail
    if (this.tool === "pencil" || this.tool === "eraser") {
      this.currentPoints.push({ x, y });
      this.redraw();

      this.ctx.save();
      this.ctx.translate(this.camera.x, this.camera.y);
      this.ctx.scale(this.camera.zoom, this.camera.zoom);

      this.ctx.beginPath();
      this.ctx.strokeStyle = this.tool === "eraser" ? "black" : "white";
      this.ctx.lineWidth = Math.max(
        this.currentStrokeWidth,
        1 / this.camera.zoom,
      );

      if (this.currentPoints.length > 0) {
        const p0 = this.currentPoints[0];
        if (p0) {
          this.ctx.moveTo(p0.x, p0.y);
        }
        for (let i = 1; i < this.currentPoints.length; i++) {
          const p = this.currentPoints[i];
          if (p) {
            this.ctx.lineTo(p.x, p.y);
          }
        }
      }
      this.ctx.stroke();
      this.ctx.restore();
      return;
    }

    // Shape Previews
    const w = x - this.startX;
    const h = y - this.startY;

    this.redraw();

    this.ctx.save();
    this.ctx.translate(this.camera.x, this.camera.y);
    this.ctx.scale(this.camera.zoom, this.camera.zoom);
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    this.ctx.lineWidth = Math.max(
      this.currentStrokeWidth,
      1 / this.camera.zoom,
    );

    if (this.tool === "rect") {
      this.ctx.strokeRect(this.startX, this.startY, w, h);
    } else if (this.tool === "circle") {
      const r = Math.max(Math.abs(w), Math.abs(h)) / 2;
      this.ctx.beginPath();
      this.ctx.arc(this.startX + w / 2, this.startY + h / 2, r, 0, Math.PI * 2);
      this.ctx.stroke();
    } else if (this.tool === "ellipse") {
      const rx = Math.abs(w) / 2;
      const ry = Math.abs(h) / 2;
      const cx = this.startX + w / 2;
      const cy = this.startY + h / 2;

      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    this.ctx.restore();
  };

  private onUp = (e: MouseEvent) => {
    if (this.isPanning) {
      this.isPanning = false;
      this.updateCursor();
      return;
    }

    if (!this.drawing) return;
    this.drawing = false;

    const { x, y } = this.getPos(e);
    const w = x - this.startX;
    const h = y - this.startY;

    let shape: Shape | null = null;
    const shapeId = crypto.randomUUID();

    if (this.tool === "rect") {
      shape = {
        id: shapeId,
        type: "rect",
        x: w < 0 ? x : this.startX,
        y: h < 0 ? y : this.startY,
        width: Math.abs(w),
        height: Math.abs(h),
        strokeWidth: this.currentStrokeWidth,
      };
    } else if (this.tool === "circle") {
      const r = Math.max(Math.abs(w), Math.abs(h)) / 2;
      shape = {
        id: shapeId,
        type: "circle",
        radius: r,
        centerX: this.startX + w / 2,
        centerY: this.startY + h / 2,
        strokeWidth: this.currentStrokeWidth,
      };
    } else if (this.tool === "ellipse") {
      const rx = Math.abs(w) / 2;
      const ry = Math.abs(h) / 2;
      shape = {
        id: shapeId,
        type: "ellipse",
        radiusX: rx, // horizontal Radius
        radiusY: ry, // vertical Radius
        centerX: this.startX + w / 2,
        centerY: this.startY + h / 2,
        strokeWidth: this.currentStrokeWidth,
      };
    } else if (this.tool === "pencil") {
      shape = {
        id: shapeId,
        type: "pencil",
        points: [...this.currentPoints],
        strokeWidth: this.currentStrokeWidth,
      };
    } else if (this.tool === "eraser") {
      shape = {
        id: shapeId,
        type: "eraser",
        points: [...this.currentPoints],
        strokeWidth: this.currentStrokeWidth,
      };
    }

    if (shape) {
      this.shapes.push(shape);
      // console.log("shape sending", shape);
      this.socket.send(
        JSON.stringify({ type: "draw", roomId: this.roomId, shape }),
      );
      this.redraw();
    }
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    const newZoom = Math.min(Math.max(this.camera.zoom + delta, 0.1), 10);

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = (mouseX - this.camera.x) / this.camera.zoom;
    const worldY = (mouseY - this.camera.y) / this.camera.zoom;

    this.camera.x = mouseX - worldX * newZoom;
    this.camera.y = mouseY - worldY * newZoom;
    this.camera.zoom = newZoom;

    this.redraw();
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.code === "Space" && !this.spacePressed) {
      this.spacePressed = true;
      this.updateCursor();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.code === "Space") {
      this.spacePressed = false;
      this.updateCursor();
    }
  };

  private updateCursor() {
    if (this.spacePressed || this.tool === "move") {
      this.canvas.style.cursor = "grab";
    } else if (this.tool === "delete" || this.tool === "eraser") {
      this.canvas.style.cursor = "crosshair";
    } else if (this.tool === "text") {
      this.canvas.style.cursor = "text";
    } else {
      this.canvas.style.cursor = "default";
    }
  }

  private createTextInput(x: number, y: number) {
    if (this.textInput) return;

    const div = document.createElement("div");
    div.contentEditable = "true";
    this.textInput = div;

    // fixed width for automatic wrapping in the UI
    const maxWidth = 400;

    div.style.position = "absolute";
    div.style.background = "transparent";
    div.style.color = "white";
    div.style.border = "1px white";
    div.style.outline = "none";
    div.style.font = `${this.currentFontSize}px sans-serif`;
    div.style.whiteSpace = "pre-wrap";
    div.style.wordBreak = "break-word";
    div.style.width = `${maxWidth}px`; // Match the wrapping width

    const rect = this.canvas.getBoundingClientRect();
    const screenX = rect.left + this.camera.x + x * this.camera.zoom;
    const screenY = rect.top + this.camera.y + y * this.camera.zoom;

    div.style.left = `${screenX}px`;
    div.style.top = `${screenY}px`;
    div.style.fontSize = `${this.currentFontSize * this.camera.zoom}px`;

    document.body.appendChild(div);
    div.focus();

    let lastEnterTime = 0;

    const finish = () => {
      if (!this.textInput) return;
      const value = div.innerText;

      if (value.trim().length > 0) {
        const shape: Shape = {
          id: crypto.randomUUID(),
          type: "text",
          x,
          y,
          text: value,
          fontSize: this.currentFontSize,
        };
        this.shapes.push(shape);
        this.socket.send(
          JSON.stringify({ type: "draw", roomId: this.roomId, shape }),
        );
      }

      if (div.parentNode) div.parentNode.removeChild(div);
      this.textInput = null;
      this.redraw();
    };

    setTimeout(() => div.addEventListener("blur", finish), 0);

    div.addEventListener("keydown", (e) => {
      // handle escape key
      if (e.key === "Escape") {
        e.preventDefault();
        // stop the blur listener so it doesn't trigger 'finish' twice
        div.removeEventListener("blur", finish);

        // save the text before the element is destroyed
        finish();
        return;
      }

      // handle double enter
      if (e.key === "Enter") {
        const currentTime = new Date().getTime();
        if (currentTime - lastEnterTime < 300) {
          e.preventDefault();
          div.removeEventListener("blur", finish);
          finish();
        }
        lastEnterTime = currentTime;
      }
    });
  }

  private bindMouse() {
    this.canvas.addEventListener("mousedown", this.onDown);
    this.canvas.addEventListener("mousemove", this.onMove);
    this.canvas.addEventListener("mouseup", this.onUp);
    this.canvas.addEventListener("wheel", this.onWheel, { passive: false });
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }
}
