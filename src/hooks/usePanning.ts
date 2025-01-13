import { useEffect, useCallback, useRef } from "react";
import useBoardStore from "../BoardStore";

interface DragState {
  isDragging: boolean;
  lastX: number;
  lastY: number;
}

export function usePanning() {
  const { currentPan, setPan, zoom, setZoom, editMode } = useBoardStore();
  const dragState = useRef<DragState>({
    isDragging: false,
    lastX: 0,
    lastY: 0,
  });

  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 1.0;
  const PAN_SPEED = 15;

  // Handle mouse-based panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const backgroundElement = document.getElementById("canvas-background");
      const clickedElement = e.target as HTMLElement;
      const isClickable = clickedElement.closest(
        ".sticky-note, button, .connection-handle"
      );
      const isBackgroundClick =
        backgroundElement === clickedElement ||
        (backgroundElement?.contains(clickedElement) && !isClickable);

      if (editMode !== "arrange" && e.button === 0 && isBackgroundClick) {
        dragState.current.isDragging = true;
        dragState.current.lastX = e.clientX;
        dragState.current.lastY = e.clientY;
      }
    },
    [editMode]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (dragState.current.isDragging) {
        const dx = e.clientX - dragState.current.lastX;
        const dy = e.clientY - dragState.current.lastY;

        setPan({
          x: currentPan.x + dx,
          y: currentPan.y + dy,
        });

        dragState.current.lastX = e.clientX;
        dragState.current.lastY = e.clientY;
      }
    },
    [currentPan, setPan]
  );

  const handleMouseUp = useCallback(() => {
    dragState.current.isDragging = false;
  }, []);

  // Keyboard-based panning
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

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
