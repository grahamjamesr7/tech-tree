import React, { useEffect, useState } from "react";
import useBoardStore, { getConnectionPoint } from "../BoardStore";
import ConnectionLine from "./ConnectionLine";
import StickyNoteV2 from "./StickyNotev2";
import SettingsMenu from "./SettingsMenu";
import GlobalMenu from "./GlobalMenu";
import GlobalTimeline from "./GlobalTimeline";
import styled from "styled-components";
import ManifestoContainer from "./ManifestoContainer";
import { getOppositeSide } from "../utils";

const GridBackground = styled.div<{ zoom: number }>`
  position: absolute;
  inset: 0;
  opacity: 0.1;
  background-size: 40px 40px;
  background-image: linear-gradient(to right, #000 1px, transparent 1px),
    linear-gradient(to bottom, #000 1px, transparent 1px);
  transform: ${({ zoom }) => `scale(${zoom})`};
  transform-origin: 0 0;
  width: ${({ zoom }) => `${100 / zoom}%`};
  height: ${({ zoom }) => `${100 / zoom}%`};
`;

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 1.0;

const SpatialBoardV2: React.FC = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeConnPosition, setActiveConnPosition] = useState({ x: 0, y: 0 });
  const {
    notes,
    connections,
    zoom,
    addNote,
    setZoom,
    endConnection,
    cancelConnection,
    activeConnection,
    settings: boardSettings,
    manifestoOpen,
    currentPan,
    setPan,
  } = useBoardStore();

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeConnection && boardSettings.createNewOnCanvasClick) {
      const rect = e.currentTarget.getBoundingClientRect();
      let x = (e.clientX - rect.left - currentPan.x) / zoom;
      let y = (e.clientY - rect.top - currentPan.y) / zoom;

      // Add edge buffer checks
      const edgeBuffer = 96;
      const offsetAmount = 128;

      if (x < edgeBuffer) x = offsetAmount;
      if (y < edgeBuffer) y = offsetAmount;
      if (x > rect.width / zoom - edgeBuffer)
        x = rect.width / zoom - offsetAmount;
      if (y > rect.height / zoom - edgeBuffer)
        y = rect.height / zoom - offsetAmount;

      const newId = addNote(x, y);
      endConnection(newId, getOppositeSide(activeConnection.fromSide));
    } else if (activeConnection) {
      cancelConnection();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();

      // Get cursor position relative to board
      const rect = e.currentTarget.getBoundingClientRect();
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
  };

  useEffect(() => {
    if (activeConnection) {
      const moveHandler = (e: MouseEvent) => {
        setActiveConnPosition({
          x: e.clientX,
          y: e.clientY,
        });
      };
      const { x, y } = getConnectionPoint(
        notes.find((i) => i.id == activeConnection.fromId)!,
        activeConnection.fromSide
      );
      setActiveConnPosition({
        x,
        y,
      });
      document.addEventListener("mousemove", moveHandler);

      return () => {
        document.removeEventListener("mousemove", moveHandler);
      };
    }
  }, [activeConnection]);

  useEffect(() => {
    const pressedKeys = new Set<string>();
    let animationFrameId: number | null = null;

    const updatePan = () => {
      const panAmount = 15 * (1 / zoom); // Reduced amount since this runs every frame
      let dx = 0;
      let dy = 0;

      if (pressedKeys.has("ArrowLeft")) dx += panAmount;
      if (pressedKeys.has("ArrowRight")) dx -= panAmount;
      if (pressedKeys.has("ArrowUp")) dy += panAmount;
      if (pressedKeys.has("ArrowDown")) dy -= panAmount;

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
        e.preventDefault(); // Prevent page scrolling
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
  });

  return (
    <div
      className="relative w-full h-screen bg-white overflow-hidden font-lato"
      onClick={handleCanvasClick}
      onWheel={handleWheel}
    >
      <SettingsMenu
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <GlobalMenu setSettingsOpen={setSettingsOpen} />
      <GlobalTimeline />
      {manifestoOpen && <ManifestoContainer />}

      {/* Grid Background */}
      {boardSettings.showGrid && <GridBackground zoom={zoom} />}

      {/* Notes and Connections */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${currentPan.x}px, ${currentPan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {notes.map((n) => (
          <StickyNoteV2 key={n.id} {...n} />
        ))}
        {connections.map((conn) => (
          <ConnectionLine key={conn.id} id={conn.id} />
        ))}
        {activeConnection && (
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ overflow: "visible" }}
          >
            {notes.find((n) => n.id === activeConnection.fromId) && (
              <line
                x1={
                  getConnectionPoint(
                    notes.find((n) => n.id === activeConnection.fromId)!,
                    activeConnection.fromSide
                  ).x
                }
                y1={
                  getConnectionPoint(
                    notes.find((n) => n.id === activeConnection.fromId)!,
                    activeConnection.fromSide
                  ).y
                }
                x2={activeConnPosition.x / zoom}
                y2={activeConnPosition.y / zoom}
                stroke="black"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            )}
          </svg>
        )}
      </div>
    </div>
  );
};

export default SpatialBoardV2;
