import React, { useEffect, useState, useCallback } from "react";
import useBoardStore, { Side } from "../BoardStore";
import { Move, Trash2 } from "lucide-react";
import { STICKY_COLORS, StickyNoteColor } from "../constants";

interface StickyNoteProps {
  id: number;
  x: number;
  y: number;
  content: string;
}

const StickyNoteV2: React.FC<StickyNoteProps> = ({ id, x, y, content }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deletionArmed, setDeletionArmed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x, y });

  const {
    deleteNote,
    startConnection,
    activeConnection,
    cancelConnection,
    endConnection,
    updateNotePosition,
    settings,
  } = useBoardStore();

  const [color, setColor] = useState<StickyNoteColor>(
    settings.defaultStickyColor
  );

  // Update position when props change
  useEffect(() => {
    setPosition({ x, y });
  }, [x, y]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    setOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging) return;

      const newX = e.clientX - 2 * offset.x + 96;
      const newY = e.clientY + 2 * offset.y + 96;

      setPosition({ x: newX, y: newY });
      updateNotePosition(id, newX, newY);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
      }
      // Add a click handler to prevent the event from reaching the canvas
      const clickHandler = (e: MouseEvent) => {
        e.stopPropagation();
        document.removeEventListener("click", clickHandler, true);
      };
      document.addEventListener("click", clickHandler, true);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, offset, id, updateNotePosition]);

  function handleDelete() {
    if (!deletionArmed) {
      setDeletionArmed(true);
    } else {
      deleteNote(id);
    }
  }

  function connectorClicked(e: React.MouseEvent<HTMLDivElement>, side: Side) {
    e.stopPropagation();
    if (!activeConnection) {
      startConnection(id, side);
    } else if (activeConnection.fromId == id) {
      cancelConnection();
    } else {
      endConnection(id, side);
    }
  }

  return (
    <div
      className={`absolute ${
        color.bgClass
      } w-48 h-48 p-4 shadow-lg rounded-sm font-lato
        ${deletionArmed ? "ring-2 ring-red-500" : ""}
        ${activeConnection?.fromId == id ? "ring-2 ring-blue-500" : ""}
        ${isDragging ? "cursor-grabbing" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
        zIndex: isDragging ? 1000 : 1,
        cursor: isDragging ? "grabbing" : "auto",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`connection-handle absolute top-0 left-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        onMouseDown={(e) => connectorClicked(e, "top")}
      />
      <div
        className={`connection-handle absolute top-1/2 right-0 w-3 h-3 bg-blue-500 rounded-full cursor-pointer transform translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        onMouseDown={(e) => connectorClicked(e, "right")}
      />
      <div
        className={`connection-handle absolute top-1/2 left-0 w-3 h-3 bg-blue-500 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        onMouseDown={(e) => connectorClicked(e, "left")}
      />
      <div
        className={`connection-handle absolute bottom-0 left-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-pointer transform -translate-x-1/2 translate-y-1/2 transition-opacity duration-200 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        onMouseDown={(e) => connectorClicked(e, "bottom")}
      />
      <div
        className={`absolute -top-10 left-0 w-full transition-opacity ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex justify-between px-2">
          <button
            className={`px-2 py-1 rounded hover:bg-gray-200 bg-white text-black flex items-center justify-center ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            onMouseDown={handleMouseDown}
          >
            <Move size={16} />
          </button>
          <button
            className="px-2 py-1 rounded hover:bg-blue-50 bg-white text-black"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
          >
            ⋯
          </button>
        </div>
        {isMenuOpen && (
          <div className="relative">
            <div className="absolute top-0 w-32 bg-white rounded shadow-lg transform translate-x-1/2">
              <button
                className="w-full px-4 py-2 text-left hover:bg-blue-50 bg-white text-black flex items-center"
                onClick={handleDelete}
              >
                <Trash2 size={16} className="mr-2" />
                {deletionArmed ? "You sure?" : "Delete"}
              </button>
              <div className="w-full px-4 py-2 flex gap-0.5">
                {STICKY_COLORS.map((stickyColor) => (
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
          </div>
        )}
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

export default StickyNoteV2;
