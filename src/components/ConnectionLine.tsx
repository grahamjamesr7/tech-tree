import React from "react";
import { Trash2 } from "lucide-react";
import useBoardStore, { Connection, getConnectionPoint } from "../BoardStore";

interface ConnectionLineProps {
  id: number;
}

/**
 * TODOs:
 * 1. add "radial" menu to center of line (should be linear along line, styled like a pill)
 * 2. move delete into "radial" menu
 * 3. allow to change dotted/solid
 * 4. allow to change curve/straight line
 */

const ConnectionLine: React.FC<ConnectionLineProps> = ({ id }) => {
  const { notes, connections, deleteConnection } = useBoardStore();

  // Find the connection data
  const connection = connections.find((conn) => conn.id === id);
  if (!connection) return null;

  // Find the connected notes
  const fromNote = notes.find((note) => note.id === connection.fromId);
  const toNote = notes.find((note) => note.id === connection.toId);
  if (!fromNote || !toNote) return null;

  // Get the connection points
  const start = getConnectionPoint(fromNote, connection.fromSide);
  const end = getConnectionPoint(toNote, connection.toSide);

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
      }}
    >
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="black"
        strokeWidth="2"
        strokeDasharray="5,5"
      />
      <g
        transform={`translate(${(start.x + end.x) / 2},${
          (start.y + end.y) / 2
        })`}
        className="pointer-events-auto"
      >
        <circle
          r="12"
          fill="black"
          stroke="white"
          strokeWidth="1"
          className="cursor-pointer hover:fill-red-100"
          onClick={(e) => {
            e.stopPropagation();
            deleteConnection(id);
          }}
        />
        <g transform="translate(-8,-8)">
          <Trash2 size={16} color="white" />
        </g>
      </g>
    </svg>
  );
};

export default ConnectionLine;
