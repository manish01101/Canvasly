import { ISyncAdapter } from "./ISyncAdapter";
import { Shape } from "../types";

export class WebSocketSyncAdapter implements ISyncAdapter {
  private messageHandler: (e: MessageEvent) => void;
  private callbacks: Parameters<ISyncAdapter["subscribe"]>[0] | null = null;

  constructor(
    private socket: WebSocket,
    private roomId: string,
  ) {
    this.messageHandler = this.handleMessage.bind(this);
    this.socket.addEventListener("message", this.messageHandler);
  }

  private handleMessage(e: MessageEvent) {
    if (!this.callbacks) return;
    try {
      const data = JSON.parse(e.data);
      if (data.type === "draw" && data.shape) {
        this.callbacks.onRemoteShapeAdded(data.shape);
      } else if (data.type === "delete_shape" && data.shapeId) {
        this.callbacks.onRemoteShapeDeleted(data.shapeId);
      }
    } catch (err) {
      console.error("[WebSocketSyncAdapter] Failed to parse message", err);
    }
  }

  subscribe(callbacks: Parameters<ISyncAdapter["subscribe"]>[0]) {
    this.callbacks = callbacks;
  }

  onShapeCreated(shape: Shape) {
    if (this.socket.readyState !== WebSocket.OPEN) {
      console.warn("[WebSocketSyncAdapter] Socket not open, dropping shape");
      return;
    }
    this.socket.send(
      JSON.stringify({ type: "draw", roomId: this.roomId, shape }),
    );
  }

  onShapeDeleted(shapeId: string) {
    if (this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(
      JSON.stringify({ type: "delete_shape", roomId: this.roomId, shapeId }),
    );
  }

  dispose() {
    this.socket.removeEventListener("message", this.messageHandler);
    this.callbacks = null;
  }
}
