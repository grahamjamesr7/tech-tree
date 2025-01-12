import { useCallback } from "react";
import useBoardStore from "../BoardStore";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 1.0;

export function useZoom() {
  const { zoom, setZoom, currentPan, setPan } = useBoardStore();

  const handleWheel = useCallback(
    (e: WheelEvent | React.WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();

        // Get cursor position relative to board
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;

        // Calculate new zoom
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.min(Math.max(zoom * delta, MIN_ZOOM), MAX_ZOOM);

        // Calculate position adjustment to keep cursor in same spot
        const scaleChange = newZoom - zoom;
        const moveX = (cursorX - currentPan.x) * (scaleChange / zoom);
        const moveY = (cursorY - currentPan.y) * (scaleChange / zoom);

        // Update state
        setZoom(newZoom);
        setPan({
          x: currentPan.x - moveX,
          y: currentPan.y - moveY,
        });
      }
    },
    [zoom, currentPan, setZoom, setPan]
  );

  return { handleWheel };
}
