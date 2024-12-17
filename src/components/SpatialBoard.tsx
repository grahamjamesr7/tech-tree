import React, { useState } from "react";
import useBoardStore from "../BoardStore";
import ConnectionLine from "./ConnectionLine";
import StickyNoteV2 from "./StickyNotev2";
import SettingsMenu from "./SettingsMenu";
import GlobalMenu from "./GlobalMenu";

const SpatialBoardV2: React.FC = () => {
  const [globalMenuOpen, setGlobalMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { notes, connections, zoom, addNote, setZoom, clearBoard } =
    useBoardStore();

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
      </div>
    </div>
  );
};

export default SpatialBoardV2;
