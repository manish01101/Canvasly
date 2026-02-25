import { Shape } from "../types";

export class ShapeManager {
  private shapes: Shape[] = [];

  load(shapes: Shape[]) {
    this.shapes = [...shapes];
  }

  getAll(): ReadonlyArray<Shape> {
    return this.shapes;
  }

  add(shape: Shape) {
    if (!this.shapes.some((s) => s.id === shape.id)) {
      this.shapes.push(shape);
    }
  }

  remove(shapeId: string) {
    this.shapes = this.shapes.filter((s) => s.id !== shapeId);
  }

  snapshot(): Shape[] {
    return [...this.shapes];
  }
}
