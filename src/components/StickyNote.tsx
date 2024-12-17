import { Trash2, PlugZap, Plug } from "lucide-react";
import React, { useState } from "react";

interface Point {
  x: number;
  y: number;
}

interface StickyNoteColor {
  name: string;
  bgClass: string;
}

const stickyColors: StickyNoteColor[] = [
  { name: "Blue", bgClass: "bg-blue-100" },
  { name: "Yellow", bgClass: "bg-yellow-100" },
  { name: "Green", bgClass: "bg-green-100" },
  { name: "Pink", bgClass: "bg-pink-100" },
  { name: "Purple", bgClass: "bg-purple-100" },
];

interface StickyNoteProps {
  id: number;
  x: number;
  y: number;
  content: string;
  onDragStart: () => void;
  onDrag: () => void;
  onDragEnd: () => void;
  onDelete: () => void;
  deletionArmed: boolean;
  handleClicked: (id: number, p: Point) => void;
}

const StickyNote = ({
  id,
  x,
  y,
  content,
  onDragStart,
  onDrag,
  onDragEnd,
  onDelete,
  deletionArmed,
  handleClicked,
  beingConnected,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [allowConnect, setAllowConnect] = useState(false);
  const [color, setColor] = useState<StickyNoteColor>(stickyColors[0]);

  const handleMouseDown = (e) => {
    if (e.target.classList.contains("connection-handle")) {
      e.stopPropagation();
      handleClicked(id, { x, y });
      return;
    }

    e.stopPropagation();
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    onDragStart(id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div
      className={`absolute ${
        color.bgClass
      } w-48 h-48 p-4 shadow-lg rounded-sm cursor-move font-lato
        ${deletionArmed ? "ring-2 ring-red-500" : ""}
        ${beingConnected ? "ring-2 ring-blue-500" : ""}`}
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
      }}
      onMouseDown={handleMouseDown}
      //   onMouseUp={() => onConnectionEnd(id)}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Connection handles */}
      <div
        className="connection-handle absolute top-0 left-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
        onMouseDown={(e) => {
          e.stopPropagation();
          if (!beingConnected) {
            handleClicked(id, { x, y: y - 96 });
          }
        }}
      />
      <div
        className="connection-handle absolute top-1/2 right-0 w-3 h-3 bg-blue-500 rounded-full cursor-pointer transform translate-x-1/2 -translate-y-1/2"
        onMouseDown={(e) => {
          e.stopPropagation();
          if (!beingConnected) {
            handleClicked(id, { x: x + 96, y });
          }
        }}
      />
      <div
        className="connection-handle absolute top-1/2 left-0 w-3 h-3 bg-blue-500 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
        onMouseDown={(e) => {
          e.stopPropagation();
          if (!beingConnected) {
            handleClicked(id, { x: x - 96, y });
          }
        }}
      />
      <div
        className="connection-handle absolute bottom-0 left-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-pointer transform -translate-x-1/2 translate-y-1/2"
        onMouseDown={(e) => {
          e.stopPropagation();
          if (!beingConnected) {
            handleClicked(id, { x, y: y + 96 });
          }
        }}
      />
      <div className="absolute top-- right-2">
        <div className="relative">
          <button
            className="p-2 rounded hover:bg-blue-50 bg-white text-black"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
          >
            ⋮
          </button>
          {isMenuOpen && (
            <div className="absolute left-10 top-0 w-32 bg-white rounded shadow-lg">
              <button
                className="w-full px-4 py-2 text-left hover:bg-blue-50 bg-white text-black flex items-center"
                onClick={handleDelete}
              >
                <Trash2 size={16} className="mr-2" />
                {deletionArmed ? "You sure?" : "Delete"}
              </button>
              <div className="w-full px-4 py-2 flex gap-0.5">
                {stickyColors.map((stickyColor) => (
                  <div
                    key={stickyColor.name}
                    className={`w-5 h-5 rounded-full ${
                      stickyColor.bgClass
                    } hover:ring-2 ring-gray-400 flex-shrink-0 ${
                      color.name === stickyColor.name
                        ? "ring-1 ring-gray-600"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setColor(stickyColor);
                      setIsMenuOpen(false);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <textarea
        className="w-full h-full bg-transparent resize-none border-none focus:outline-none font-lato text-black"
        defaultValue={content}
        placeholder="Enter your note..."
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default StickyNote;
