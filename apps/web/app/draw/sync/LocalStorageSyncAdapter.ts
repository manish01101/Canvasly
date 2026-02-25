import { ISyncAdapter } from "./ISyncAdapter";
import { Shape } from "../types";

const STORAGE_KEY = "local_shapes";

export class LocalStorageSyncAdapter implements ISyncAdapter {
  private getShapes: (() => Shape[]) | null = null;

  // Called by CanvasEngine after boot so the adapter can pull current shapes
  bindShapeSource(fn: () => Shape[]) {
    this.getShapes = fn;
  }

  private flush() {
    if (!this.getShapes) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.getShapes()));
    } catch (err) {
      console.error("[LocalStorageSyncAdapter] Failed to save", err);
    }
  }

  load(): Shape[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("[LocalStorageSyncAdapter] Failed to load", err);
      return [];
    }
  }

  subscribe(_callbacks: Parameters<ISyncAdapter["subscribe"]>[0]) {
    // no remote changes in local mode
  }

  onShapeCreated(_shape: Shape) {
    this.flush();
  }

  onShapeDeleted(_shapeId: string) {
    this.flush();
  }

  dispose() {}
}
