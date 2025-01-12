import { useEffect } from "react";
import useBoardStore from "../BoardStore";

export function usePanning() {
  const { currentPan, setPan, zoom, setZoom } = useBoardStore();
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 1.0;
  const PAN_SPEED = 15;

  useEffect(() => {
    const pressedKeys = new Set<string>();
    let animationFrameId: number | null = null;

    const updatePan = () => {
      let dx = 0;
      let dy = 0;

      if (pressedKeys.has("ArrowLeft")) dx += PAN_SPEED;
      if (pressedKeys.has("ArrowRight")) dx -= PAN_SPEED;
      if (pressedKeys.has("ArrowUp")) dy += PAN_SPEED;
      if (pressedKeys.has("ArrowDown")) dy -= PAN_SPEED;

      if (dx !== 0 || dy !== 0) {
        setPan({
          x: currentPan.x + dx,
          y: currentPan.y + dy,
        });
        animationFrameId = requestAnimationFrame(updatePan);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        if (!pressedKeys.has(e.key)) {
          pressedKeys.add(e.key);
          if (animationFrameId === null) {
            animationFrameId = requestAnimationFrame(updatePan);
          }
        }
      } else if (e.ctrlKey) {
        switch (e.key) {
          case "+":
            e.preventDefault();
            setZoom(Math.min(zoom * 1.1, MAX_ZOOM));
            break;
          case "-":
            e.preventDefault();
            setZoom(Math.max(zoom * 0.9, MIN_ZOOM));
            break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.startsWith("Arrow")) {
        pressedKeys.delete(e.key);
        if (pressedKeys.size === 0 && animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [currentPan, setPan, zoom, setZoom]);
}
