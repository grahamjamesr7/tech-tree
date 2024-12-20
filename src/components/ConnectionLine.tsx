import React, { useState } from "react";
import { Trash2, Ellipsis, Minus, ArrowRight, X } from "lucide-react";
import useBoardStore, {
  ConnectionStyle,
  getConnectionPoint,
} from "../BoardStore";

interface ConnectionLineProps {
  id: number;
}

interface RadialMenuProps {
  x: number;
  y: number;
  style: ConnectionStyle;
  onStyleChange: (style: Partial<ConnectionStyle>) => void;
  onDelete: () => void;
  close: () => void;
}

function getIncomingArrowRotation(
  side: "top" | "right" | "bottom" | "left"
): number {
  switch (side) {
    case "top":
      return 90; // Point upward
    default:
      return 0;
    case "right":
      return 180; // Point rightward
    case "bottom":
      return 270; // Point downward
    case "left":
      return 0; // Point leftward
  }
}

export const RadialMenu: React.FC<RadialMenuProps> = ({
  x,
  y,
  style,
  onStyleChange,
  onDelete,
  close,
}) => {
  return (
    <div
      className="absolute bg-white rounded-full shadow-lg p-2 flex items-center gap-2 text-black"
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <button
        className="p-1 hover:bg-gray-100 rounded-full"
        onClick={() =>
          onStyleChange({
            type: style.type === "dependency" ? "informs" : "dependency",
          })
        }
      >
        <span className="text-sm font-mono">
          {style.type === "dependency" ? "Depends" : "Informs"}
        </span>
      </button>
      <button
        className="p-1 hover:bg-gray-100 rounded-full"
        onClick={() => onStyleChange({ isCurved: !style.isCurved })}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {style.isCurved ? (
            <path d="M4 12 C 8 4, 16 20, 20 12" />
          ) : (
            <path d="M4 12 C 8 12, 16 12, 20 12" />
          )}
        </svg>
      </button>
      <button className="p-1 hover:bg-gray-100 rounded-full" onClick={onDelete}>
        <Trash2 size={16} className="text-red-500" />
      </button>

      <button className="p-1 hover:bg-gray-100 rounded-full" onClick={close}>
        <X size={16} />
      </button>
    </div>
  );
};

const ConnectionLine: React.FC<ConnectionLineProps> = ({ id }) => {
  const { notes, connections, deleteConnection, updateConnection } =
    useBoardStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // Calculate midpoints for the Bezier curve
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  // Calculate the path with control points based on the connection sides
  let controlPoint1X = midX;
  let controlPoint1Y = start.y;
  let controlPoint2X = midX;
  let controlPoint2Y = end.y;

  if (!connection.style.isCurved) {
    controlPoint1X = start.x;
    controlPoint1Y = start.y;
    controlPoint2X = end.x;
    controlPoint2Y = end.y;
  }

  // Create the path for the connection line
  const path = `M ${start.x} ${start.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${end.x} ${end.y}`;

  const handleStyleChange = (styleUpdate: Partial<ConnectionStyle>) => {
    const newStyle = { ...connection.style, ...styleUpdate };
    updateConnection(id, { style: newStyle });
  };

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full"
      style={{ overflow: "visible" }}
    >
      {/* Define the arrowhead marker */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="6"
          markerHeight="4"
          refX="3"
          refY="2"
          // orient="auto-start-reverse"
          orient={getIncomingArrowRotation(connection.toSide)}
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 5 2, 0 4" fill="black" stroke="none" />
        </marker>
      </defs>

      {/* Invisible wider path for better click target */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="20"
        fill="none"
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setIsMenuOpen(!isMenuOpen);
        }}
      />

      {/* Visible path */}
      <path
        d={path}
        stroke="black"
        strokeWidth={connection.style.type === "informs" ? 4 : 6}
        strokeDasharray={connection.style.type === "informs" ? "5,5" : "none"}
        fill="none"
        pointerEvents="none"
        markerEnd="url(#arrowhead)"
      />

      {/* Radial menu */}
      {isMenuOpen && (
        <foreignObject
          x={midX - 100}
          y={midY - 20}
          width="200"
          height="40"
          style={{ overflow: "visible" }}
        >
          <div className="relative w-full h-full">
            <RadialMenu
              x={100}
              y={20}
              style={connection.style}
              onStyleChange={handleStyleChange}
              onDelete={() => deleteConnection(id)}
              close={() => setIsMenuOpen(false)}
            />
          </div>
        </foreignObject>
      )}
    </svg>
  );
};

export default ConnectionLine;
