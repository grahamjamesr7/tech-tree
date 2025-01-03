import React, { useEffect, useState } from "react";
import useBoardStore, {
  Side,
  STICKY_SIZE_COPY_MAP,
  STICKY_SIZE_NUMERIC_MAP,
} from "../BoardStore";
import { Move } from "lucide-react";
import StickyMenu from "./StickyMenu";
import { adjustHexColor } from "../utils";

interface StickyNoteProps {
  id: number;
  x: number;
  y: number;
}

const StickyNoteV2: React.FC<StickyNoteProps> = ({ id, x, y }) => {
  const {
    startConnection,
    activeConnection,
    cancelConnection,
    endConnection,
    updateNote,
    notes,
    settings,
  } = useBoardStore();

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);

  const thisNote = notes.find((i) => i.id == id);
  if (!thisNote) {
    return (
      <div className="flex flex-col items-center justify-center">
        <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 2L1 21h22M12 6l7.53 13H4.47M11 10v4h2v-4m-2 6v2h2v-2"
          />
        </svg>
        <div className="text-red-500 mt-2">Note not found</div>
      </div>
    );
  }

  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        setIsEditing(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

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

      updateNote({ id, x: newX, y: newY }); // short circuit, we need the connection to move with the sticky
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
  }, [isDragging, offset, id, updateNote]);

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
        thisNote.color.bgClass
      } w-48 h-48 p-4 shadow-lg rounded-sm font-lato flex flex-col
      ${activeConnection?.fromId == id ? "ring-2 ring-blue-500" : ""}
      ${isDragging ? "cursor-grabbing" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        left: thisNote.x,
        top: thisNote.y,
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
        </div>
        <StickyMenu id={id} isVisible={isHovered} />
      </div>
      <textarea
        className="w-full bg-transparent resize-none border-none focus:outline-none font-lato text-black font-bold text-lg mb-2"
        style={{
          height: "1.5rem",
          minHeight: "1.5rem",
          maxHeight: "3rem",
          lineHeight: "1.5rem",
          overflow: "hidden",
        }}
        placeholder="Title..."
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        value={thisNote.title}
        ref={(textarea) => {
          if (textarea) {
            textarea.style.height = "1.5rem";
            const scrollHeight = Math.min(textarea.scrollHeight, 48);
            textarea.style.height = scrollHeight + "px";
          }
        }}
        onChange={(e) => {
          updateNote({ id, title: e.target.value });
          setIsEditing(true);
          // Automatically adjust height based on content
          e.target.style.height = "1.5rem";
          const scrollHeight = Math.min(e.target.scrollHeight, 48);
          e.target.style.height = scrollHeight + "px";
        }}
      />
      <textarea
        className="w-full flex-1 bg-transparent resize-none border-none focus:outline-none font-lato text-black text-sm"
        placeholder="Description..."
        onClick={(e) => e.stopPropagation()}
        value={thisNote.content}
        onChange={(e) => {
          updateNote({ id, content: e.target.value });
          setIsEditing(true);
        }}
      />
      {thisNote.size && !isEditing && (
        <div
          className={`absolute bottom-2 right-2`}
          style={{
            color: adjustHexColor(thisNote.color.rawColor, -0.2),
            fontWeight: 700,
            opacity: !isEditing ? 1 : 0,
            transition: "opacity 1s ease-in-out",
          }}
        >
          {settings.showPoints
            ? STICKY_SIZE_NUMERIC_MAP[thisNote.size]
            : STICKY_SIZE_COPY_MAP[thisNote.size]}
        </div>
      )}
    </div>
  );
};

export default StickyNoteV2;
