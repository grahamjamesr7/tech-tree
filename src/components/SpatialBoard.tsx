import React from "react";
import useBoardStore from "../BoardStore";
import ConnectionLine from "./ConnectionLine";
import StickyNoteV2 from "./StickyNotev2";

const SpatialBoardV2: React.FC = () => {
  const { notes, connections, zoom, addNote, setZoom } = useBoardStore();

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.debug("click", e.target, e.currentTarget);
    // if (e.target === e.currentTarget) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    addNote(x, y);
    // }
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
