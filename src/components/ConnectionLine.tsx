import React, { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import useBoardStore, { ConnectionStyle } from "../BoardStore";
import { getConnectionPoint } from "../utils";

interface ConnectionLineProps {
  id: number;
}

interface RadialMenuProps {
  id: number;
  x: number;
  y: number;
  style: ConnectionStyle;
  onStyleChange: (style: Partial<ConnectionStyle>) => void;
  onDelete: () => void;
  close: () => void;
}

function calculateArrowRotation(
  endPoint: { x: number; y: number },
  controlPoint: { x: number; y: number }
): number {
  // Calculate the angle between the last control point and the end point
  const dx = endPoint.x - controlPoint.x;
  const dy = endPoint.y - controlPoint.y;
  // Convert to degrees and adjust for SVG marker orientation (which points right by default)
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

export const RadialMenu: React.FC<RadialMenuProps> = ({
  id,
  x,
  y,
  style,
  onStyleChange,
  onDelete,
  close,
}) => {
  return (
    <div
      data-connection-menu={id}
      className="absolute bg-slate-800 border border-slate-600 rounded-full shadow-lg p-2 flex items-center gap-2 text-white"
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        zIndex: 10000,
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <button
        className="p-1 hover:bg-slate-700 rounded-full"
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
        className="p-1 hover:bg-slate-700 rounded-full"
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
      <button className="p-1 hover:bg-slate-700 rounded-full" onClick={onDelete}>
        <Trash2 size={16} className="text-red-400" />
      </button>

      <button className="p-1 hover:bg-slate-700 rounded-full" onClick={close}>
        <X size={16} />
      </button>
    </div>
  );
};

const ConnectionLine: React.FC<ConnectionLineProps> = ({ id }) => {
  const {
    notes,
    connections,
    deleteConnection,
    updateConnection,
    editMode,
    changeSelectedConnection,
    selectedConnection,
  } = useBoardStore();

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

  // Calculate control points
  let controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (connection.style.isCurved) {
    // For curved lines, calculate control points based on connection sides
    const CURVE_STRENGTH = length / 3; // Distance of control points from anchors

    // Calculate control point directions based on connection sides
    const getControlPointOffset = (
      side: "top" | "right" | "bottom" | "left"
    ) => {
      switch (side) {
        case "top":
          return { dx: 0, dy: -CURVE_STRENGTH };
        case "right":
          return { dx: CURVE_STRENGTH, dy: 0 };
        case "bottom":
          return { dx: 0, dy: CURVE_STRENGTH };
        case "left":
          return { dx: -CURVE_STRENGTH, dy: 0 };
      }
    };

    // Get offsets for both ends
    const startOffset = getControlPointOffset(connection.fromSide);
    const endOffset = getControlPointOffset(connection.toSide);

    // Calculate control points by extending from start/end in the appropriate directions
    controlPoint1X = start.x + startOffset.dx;
    controlPoint1Y = start.y + startOffset.dy;
    controlPoint2X = end.x + endOffset.dx;
    controlPoint2Y = end.y + endOffset.dy;
  } else {
    // For straight lines, use a point slightly before the end
    const ratio = 0.9; // Use a point 90% along the line
    controlPoint2X = start.x + dx * ratio;
    controlPoint2Y = start.y + dy * ratio;
    controlPoint1X = start.x + dx * (1 - ratio);
    controlPoint1Y = start.y + dy * (1 - ratio);
  }

  // Calculate rotation based on the direction between last control point and end point
  const arrowRotation = calculateArrowRotation(end, {
    x: controlPoint2X,
    y: controlPoint2Y,
  });

  // Create the path for the connection line
  const path = `M ${start.x} ${start.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${end.x} ${end.y}`;

  const handleStyleChange = (styleUpdate: Partial<ConnectionStyle>) => {
    const newStyle = { ...connection.style, ...styleUpdate };
    updateConnection(id, { style: newStyle });
  };

  // Add click handler effect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if this connection is selected
      if (selectedConnection === id) {
        // Check if click was outside menu
        const menu = document.querySelector(`[data-connection-menu="${id}"]`);
        if (menu && !menu.contains(event.target as Node)) {
          changeSelectedConnection(undefined);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id, selectedConnection, changeSelectedConnection]);

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full"
      style={{ overflow: "visible", pointerEvents: "none" }}
    >
      {/* Define the arrowhead marker */}
      <defs>
        <marker
          id={`arrowhead-${id}`}
          markerWidth="6"
          markerHeight="4"
          refX="3"
          refY="2"
          orient={arrowRotation}
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 5 2, 0 4" fill="white" stroke="none" />
        </marker>
      </defs>

      {/* Invisible wider path for better click target */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="20"
        fill="none"
        style={{
          pointerEvents: "stroke",
          cursor: editMode == "add" ? "pointer" : "default",
        }}
        onClick={(e) => {
          if (editMode == "add") {
            e.stopPropagation();
            if (selectedConnection != id) {
              changeSelectedConnection(id);
            }
          }
        }}
      />

      {/* Visible path */}
      <path
        d={path}
        stroke="white"
        strokeOpacity={0.6}
        strokeWidth={connection.style.type === "informs" ? 4 : 6}
        strokeDasharray={connection.style.type === "informs" ? "5,5" : "none"}
        fill="none"
        pointerEvents="none"
        markerEnd={`url(#arrowhead-${id})`}
      />

      {/* Radial menu */}
      {selectedConnection == id && (
        <foreignObject
          x={midX - 100}
          y={midY - 20}
          width="200"
          height="40"
          style={{ overflow: "visible", pointerEvents: "none" }}
        >
          <div
            className="relative w-full h-full"
            style={{ pointerEvents: "auto" }}
          >
            <RadialMenu
              id={id}
              x={100}
              y={20}
              style={connection.style}
              onStyleChange={handleStyleChange}
              onDelete={() => deleteConnection(id)}
              close={() => changeSelectedConnection(undefined)}
            />
          </div>
        </foreignObject>
      )}
    </svg>
  );
};

export default ConnectionLine;
