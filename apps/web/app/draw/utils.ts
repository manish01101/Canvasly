import { Shape } from "./types";

export function isPointInShape(shape: Shape, x: number, y: number): boolean {
  if (shape.type === "rect") {
    const sx = shape.x ?? 0;
    const sy = shape.y ?? 0;
    const sw = shape.width ?? 0;
    const sh = shape.height ?? 0;
    return x >= sx && x <= sx + sw && y >= sy && y <= sy + sh;
  } else if (shape.type === "circle") {
    const cx = shape.centerX ?? 0;
    const cy = shape.centerY ?? 0;
    const r = shape.radius ?? 0;
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    return dist <= r;
  } else if (shape.type === "pencil" || shape.type === "eraser") {
    if (!shape.points || shape.points.length < 2) return false;

    // Check distance to the LINE SEGMENTS, not just points
    // This makes clicking fast strokes much easier
    for (let i = 0; i < shape.points.length - 1; i++) {
      const p1 = shape.points[i];
      const p2 = shape.points[i + 1];

      if (!p1 || !p2) continue;

      const dist = distanceToSegment(x, y, p1.x, p1.y, p2.x, p2.y);
      if (dist < 10) return true; // 10px tolerance
    }
  }

  return false;
}

// Helper: Distance from point (x,y) to line segment (x1,y1)-(x2,y2)
function distanceToSegment(
  x: number,
  y: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;
  if (len_sq !== 0) param = dot / len_sq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}
