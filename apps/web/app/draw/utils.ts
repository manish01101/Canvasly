import { Shape } from "./types";

export function isPointInShape(shape: Shape, x: number, y: number): boolean {
  // Base tolerance for clicking
  const hitTolerance = 10;
  // Adjust tolerance based on stroke width (thicker lines = easier to click)
  const halfStroke = (shape.strokeWidth || 2) / 2;
  const tolerance = Math.max(hitTolerance, halfStroke);

  if (shape.type === "rect") {
    const sx = shape.x ?? 0;
    const sy = shape.y ?? 0;
    const sw = shape.width ?? 0;
    const sh = shape.height ?? 0;

    const withinVerticalBounds =
      y >= sy - tolerance && y <= sy + sh + tolerance;
    const withinHorizontalBounds =
      x >= sx - tolerance && x <= sx + sw + tolerance;

    // Check Left or Right edge
    const nearLeftRight =
      (Math.abs(x - sx) <= tolerance || Math.abs(x - (sx + sw)) <= tolerance) &&
      withinVerticalBounds;

    // Check Top or Bottom edge
    const nearTopBottom =
      (Math.abs(y - sy) <= tolerance || Math.abs(y - (sy + sh)) <= tolerance) &&
      withinHorizontalBounds;

    return nearLeftRight || nearTopBottom;
  }

  if (shape.type === "circle") {
    const cx = shape.centerX ?? 0;
    const cy = shape.centerY ?? 0;
    const r = shape.radius ?? 0;

    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

    // Check if distance is approximately the radius (within tolerance)
    // This makes it a "Hollow" circle.
    return Math.abs(dist - r) <= tolerance;
  }

  if (shape.type === "ellipse") {
    const cx = shape.centerX ?? 0;
    const cy = shape.centerY ?? 0;

    // Support both new Ellipses (radiusX/Y) and old Circles (radius)
    const rx = shape.radiusX ?? shape.radius ?? 0;
    const ry = shape.radiusY ?? shape.radius ?? 0;

    // Normalize the distance based on the equation of an ellipse:
    // (x-h)^2 / a^2 + (y-k)^2 / b^2 = 1
    const normalizedDist =
      Math.pow((x - cx) / rx, 2) + Math.pow((y - cy) / ry, 2);

    const distGap = tolerance / Math.min(rx, ry);

    return Math.abs(normalizedDist - 1) < distGap;
  }

  if (shape.type === "pencil" || shape.type === "eraser") {
    if (!shape.points || shape.points.length < 2) return false;

    for (let i = 0; i < shape.points.length - 1; i++) {
      const p1 = shape.points[i];
      const p2 = shape.points[i + 1];

      if (!p1 || !p2) continue;

      const dist = distanceToSegment(x, y, p1.x, p1.y, p2.x, p2.y);
      if (dist < tolerance) return true;
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
