import React, { useEffect, useState } from "react";
import useBoardStore, { getConnectionPoint } from "../BoardStore";
import ConnectionLine from "./ConnectionLine";
import StickyNoteV2 from "./StickyNotev2";
import SettingsMenu from "./SettingsMenu";
import GlobalMenu from "./GlobalMenu";

const SpatialBoardV2: React.FC = () => {
  const [globalMenuOpen, setGlobalMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeConnPosition, setActiveConnPosition] = useState({ x: 0, y: 0 });
  const { notes, connections, zoom, addNote, setZoom, activeConnection } =
    useBoardStore();

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeConnection) {
      useBoardStore.getState().cancelConnection();
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    let x = (e.clientX - rect.left) / zoom;
    let y = (e.clientY - rect.top) / zoom;

    // Adjust position if too close to edges
    const edgeBuffer = 96;
    const offsetAmount = 128;

    if (x < edgeBuffer) x = offsetAmount;
    if (y < edgeBuffer) y = offsetAmount;
    if (x > rect.width / zoom - edgeBuffer)
      x = rect.width / zoom - offsetAmount;
    if (y > rect.height / zoom - edgeBuffer)
      y = rect.height / zoom - offsetAmount;

    addNote(x, y);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(Math.min(Math.max(zoom * delta, 0.1), 5));
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
      className="relative w-full h-screen bg-white overflow-hidden font-lato"
      onClick={handleCanvasClick}
      onWheel={handleWheel}
    >
      <SettingsMenu
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <div
        className="absolute inset-0 bg-grid-pattern opacity-10"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      />

      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "0 0",
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <GlobalMenu setSettingsOpen={setSettingsOpen} />
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
