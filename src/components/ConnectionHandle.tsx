// src/components/ConnectionHandle.jsx
import React from "react";

const ConnectionHandle = ({
  position,
  onConnectionStart,
  noteId,
  noteX,
  noteY,
}) => {
  const positions = {
    right: {
      className: "top-1/2 right-0 translate-x-1/2 -translate-y-1/2",
      connectionPoint: { x: noteX + 96, y: noteY },
    },
    left: {
      className: "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2",
      connectionPoint: { x: noteX - 96, y: noteY },
    },
    bottom: {
      className: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
      connectionPoint: { x: noteX, y: noteY + 96 },
    },
  };

  const positionStyle = positions[position];

  return (
    <div
      className={`connection-handle absolute w-3 h-3 bg-blue-500 rounded-full cursor-pointer transform ${positionStyle.className}`}
      onMouseDown={(e) => {
        e.stopPropagation();
        onConnectionStart(noteId, positionStyle.connectionPoint);
      }}
    />
  );
};

export default ConnectionHandle;
