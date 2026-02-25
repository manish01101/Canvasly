export type Camera = { x: number; y: number; zoom: number };

export class CameraController {
  private camera: Camera = { x: 0, y: 0, zoom: 1 };

  getCamera(): Readonly<Camera> {
    return this.camera;
  }

  pan(dx: number, dy: number) {
    this.camera.x += dx;
    this.camera.y += dy;
  }

  zoomAt(deltaY: number, mouseX: number, mouseY: number) {
    const newZoom = Math.min(
      Math.max(this.camera.zoom + -deltaY * 0.001, 0.1),
      10,
    );
    const worldX = (mouseX - this.camera.x) / this.camera.zoom;
    const worldY = (mouseY - this.camera.y) / this.camera.zoom;
    this.camera = {
      x: mouseX - worldX * newZoom,
      y: mouseY - worldY * newZoom,
      zoom: newZoom,
    };
  }

  /** Convert screen coords → world coords */
  toWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this.camera.x) / this.camera.zoom,
      y: (screenY - this.camera.y) / this.camera.zoom,
    };
  }
}
