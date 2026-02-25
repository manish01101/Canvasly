import { Shape } from "../types";
import { Camera } from "./CameraController";

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
  }

  render(shapes: ReadonlyArray<Shape>, camera: Readonly<Camera>) {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    for (const shape of shapes) {
      this.drawShape(shape, camera.zoom);
    }

    ctx.restore();
  }

  // Used during live drawing to overlay an in-progress preview
  renderOverlay(
    draw: (ctx: CanvasRenderingContext2D) => void,
    camera: Readonly<Camera>,
  ) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);
    draw(ctx);
    ctx.restore();
  }

  private drawShape(s: Shape, zoom: number) {
    const { ctx } = this;
    ctx.strokeStyle = s.type === "eraser" ? "black" : "white";
    ctx.lineWidth = Math.max(s.strokeWidth ?? 2, 1 / zoom);
    ctx.beginPath();

    switch (s.type) {
      case "rect":
        ctx.strokeRect(s.x ?? 0, s.y ?? 0, s.width ?? 0, s.height ?? 0);
        break;
      case "circle":
        ctx.arc(s.centerX ?? 0, s.centerY ?? 0, s.radius ?? 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case "ellipse":
        ctx.ellipse(
          s.centerX ?? 0,
          s.centerY ?? 0,
          s.radiusX ?? s.radius ?? 0,
          s.radiusY ?? s.radius ?? 0,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
        break;
      case "pencil":
      case "eraser":
        this.drawStroke(s.points ?? []);
        break;
      case "text":
        this.drawText(s, zoom);
        break;
    }
  }

  private drawStroke(points: { x: number; y: number }[]) {
    if (points.length < 2) return;
    const [first, ...rest] = points;
    this.ctx.moveTo(first!.x, first!.y);
    rest.forEach((p) => this.ctx.lineTo(p.x, p.y));
    this.ctx.stroke();
  }

  private drawText(s: Shape, zoom: number) {
    const { ctx } = this;
    const fontSize = s.fontSize ?? 20;
    const maxWidth = 400;
    const lineHeight = fontSize * 1.2;
    let yOffset = s.y ?? 0;

    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = "white";
    ctx.textBaseline = "top";

    for (const paragraph of (s.text ?? "").split("\n")) {
      const words = paragraph.split(" ");
      let line = "";
      for (const word of words) {
        const test = line + word + " ";
        if (ctx.measureText(test).width > maxWidth && line) {
          ctx.fillText(line, s.x ?? 0, yOffset);
          line = word + " ";
          yOffset += lineHeight;
        } else {
          line = test;
        }
      }
      ctx.fillText(line, s.x ?? 0, yOffset);
      yOffset += lineHeight;
    }
  }
}
