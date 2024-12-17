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
      <button
        className="p-1 hover:bg-gray-100 rounded-full"
        onClick={() => onStyleChange({ isDirectional: !style.isDirectional })}
      >
        <ArrowRight size={16} />
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

  // Calculate control points for curved path
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const controlPoint1X = connection.style.isCurved ? midX : start.x;
  const controlPoint1Y = connection.style.isCurved ? start.y : start.y;
  const controlPoint2X = connection.style.isCurved ? midX : end.x;
  const controlPoint2Y = connection.style.isCurved ? end.y : end.y;

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
        strokeWidth={connection.style.type == "informs" ? 2 : 6}
        strokeDasharray={connection.style.type == "informs" ? "5,5" : "none"}
        fill="none"
        pointerEvents="none"
      />

      {/* Arrow marker if directional */}
      {connection.style.isDirectional && (
        <marker
          id={`arrowhead-${id}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="black" />
        </marker>
      )}

      {/* Radial menu */}
      {isMenuOpen && (
        <foreignObject
          x={midX - 100} // Offset to ensure menu is centered
          y={midY - 20} // Offset for vertical centering
          width="200" // Fixed width to contain the menu
          height="40" // Fixed height to contain the menu
          style={{ overflow: "visible" }}
        >
          <div className="relative w-full h-full">
            <RadialMenu
              x={100} // Center point of the foreignObject
              y={20} // Center point of the foreignObject
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
