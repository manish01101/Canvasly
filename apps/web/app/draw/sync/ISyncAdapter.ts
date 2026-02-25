import { Shape } from "../types";

export interface ISyncAdapter {
  // called when a new shape is finalized locally
  onShapeCreated(shape: Shape): void;

  // called when a shape is deleted locally
  onShapeDeleted(shapeId: string): void;

  /**
   register a listener, engine calls this on init so the adapter
   can push remote changes (WS messages, storage events) back in.
   */
  subscribe(callbacks: {
    onRemoteShapeAdded: (shape: Shape) => void;
    onRemoteShapeDeleted: (shapeId: string) => void;
  }): void;

  // called on engine destroy
  dispose(): void;
}
