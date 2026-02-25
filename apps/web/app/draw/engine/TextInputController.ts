import { Shape } from "../types";
import { Camera } from "./CameraController";

type OnCommit = (shape: Shape) => void;

export class TextInputController {
  private activeDiv: HTMLDivElement | null = null;

  isActive() {
    return this.activeDiv !== null;
  }

  open(
    worldX: number,
    worldY: number,
    fontSize: number,
    camera: Readonly<Camera>,
    canvasRect: DOMRect,
    onCommit: OnCommit,
  ) {
    if (this.activeDiv) return;

    const div = document.createElement("div");
    div.contentEditable = "true";
    this.activeDiv = div;

    const screenX = canvasRect.left + camera.x + worldX * camera.zoom;
    const screenY = canvasRect.top + camera.y + worldY * camera.zoom;

    Object.assign(div.style, {
      position: "fixed",
      background: "transparent",
      color: "white",
      outline: "none",
      font: `${fontSize * camera.zoom}px sans-serif`,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      width: "400px",
      left: `${screenX}px`,
      top: `${screenY}px`,
    });

    document.body.appendChild(div);
    div.focus();

    let lastEnterTime = 0;

    const commit = () => {
      if (!this.activeDiv) return;
      const text = div.innerText.trim();
      if (text) {
        onCommit({
          id: crypto.randomUUID(),
          type: "text",
          x: worldX,
          y: worldY,
          text,
          fontSize,
        });
      }
      div.parentNode?.removeChild(div);
      this.activeDiv = null;
    };

    setTimeout(() => div.addEventListener("blur", commit), 0);

    div.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        div.removeEventListener("blur", commit);
        commit();
        return;
      }
      if (e.key === "Enter") {
        const now = Date.now();
        if (now - lastEnterTime < 300) {
          e.preventDefault();
          div.removeEventListener("blur", commit);
          commit();
        }
        lastEnterTime = now;
      }
    });
  }
}
