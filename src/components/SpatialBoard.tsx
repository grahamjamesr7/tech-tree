import React, { useEffect, useState } from "react";
import useBoardStore from "../BoardStore";
import ConnectionLine from "./ConnectionLine";
import StickyNoteV2 from "./sticky/StickyNotev2";
import SettingsMenu from "./controls/SettingsMenu";
import GlobalTimeline from "./decorations/GlobalTimeline";
import styled from "styled-components";
import ManifestoContainer from "./ManifestoContainer";
import { getConnectionPoint, getOppositeSide } from "../utils";
import { usePanning } from "../hooks/usePanning";
import { useZoom } from "../hooks/useZoom";
import GlobalMenu from "./controls/GlobalMenu";
import Autosaver from "./AutoSaver";

const GridBackground = styled.div<{
  zoom: number;
  pan: { x: number; y: number };
}>`
  position: fixed; // Changed from absolute to fixed
  inset: 0;
  opacity: 0.1;
  background-size: ${({ zoom }) => `${40 * zoom}px ${40 * zoom}px`};
  background-image: linear-gradient(to right, #000 1px, transparent 1px),
    linear-gradient(to bottom, #000 1px, transparent 1px);
  background-position: ${({ pan }) => `${pan.x}px ${pan.y}px`};
  pointer-events: none;
`;

const SpatialBoardV2: React.FC = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeConnPosition, setActiveConnPosition] = useState({ x: 0, y: 0 });
  const {
    notes,
    connections,
    zoom,
    addNote,
    endConnection,
    cancelConnection,
    activeConnection,
    settings: boardSettings,
    manifestoOpen,
    currentPan,
  } = useBoardStore();

  const { handleMouseDown, handleMouseMove, handleMouseUp } = usePanning();
  const { handleWheel } = useZoom();

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

  return (
    <div
      id="canvas-background"
      className="relative w-full h-screen bg-white overflow-hidden font-lato"
      onClick={handleCanvasClick}
      onWheel={handleWheel}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseUp}
    >
      <SettingsMenu
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <GlobalMenu setSettingsOpen={setSettingsOpen} />
      <Autosaver />
      <GlobalTimeline />
      {manifestoOpen && <ManifestoContainer />}

      {/* Grid Background */}
      {boardSettings.showGrid && (
        <GridBackground zoom={zoom} pan={currentPan} />
      )}

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
