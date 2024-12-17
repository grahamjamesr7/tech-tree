import React from "react";
import { Trash2 } from "lucide-react";

const ConnectionLine = ({ start, end, onDelete }) => {
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
      {onDelete && (
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
              onDelete();
            }}
          />
          <g transform="translate(-8,-8)">
            <Trash2 size={16} />
          </g>
        </g>
      )}
    </svg>
  );
};

export default ConnectionLine;
