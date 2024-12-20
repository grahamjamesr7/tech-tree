import React, { useEffect, useState, useCallback } from "react";
import useBoardStore, { Note, Side } from "../BoardStore";
import { Move, Trash2 } from "lucide-react";
import { STICKY_COLORS, StickyNoteColor } from "../constants";

interface StickyNoteProps {
  id: number;
  x: number;
  y: number;
}

const StickyNoteV2: React.FC<StickyNoteProps> = ({ id, x, y }) => {
  const {
    deleteNote,
    startConnection,
    activeConnection,
    cancelConnection,
    endConnection,
    updateNote,
    settings,
    notes,
  } = useBoardStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deletionArmed, setDeletionArmed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

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

  const [localNote, setLocalNote] = useState<Note>({
    title: thisNote.title || "",
    content: thisNote.content || "",
    id: id,
    x: x,
    y: y,
    recursive: false,
    color: thisNote.color,
  });

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

      const updatedNote = { ...localNote, x: newX, y: newY };
      setLocalNote(updatedNote);
      updateNote(updatedNote); // short circuit, we need the connection to move with the sticky
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

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      // Deep equality check between localNote and thisNote
      const hasChanged = JSON.stringify(localNote) !== JSON.stringify(thisNote);

      if (hasChanged) {
        updateNote(localNote);
      }
    }, 1000);

    return () => clearTimeout(debounceTimeout);
  }, [localNote, id, thisNote]);

  return (
    <div
      className={`absolute ${
        localNote.color.bgClass
      } w-48 h-48 p-4 shadow-lg rounded-sm font-lato flex flex-col
      ${deletionArmed ? "ring-2 ring-red-500" : ""}
      ${activeConnection?.fromId == id ? "ring-2 ring-blue-500" : ""}
      ${isDragging ? "cursor-grabbing" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        left: localNote.x,
        top: localNote.y,
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
                      localNote.color.name === stickyColor.name
                        ? "ring-1 ring-gray-600"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocalNote({ ...localNote, color: stickyColor });
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
        className="w-full bg-transparent resize-none border-none focus:outline-none font-lato text-black font-bold text-lg mb-2 h-8"
        placeholder="Title..."
        onClick={(e) => e.stopPropagation()}
        value={localNote.title}
        onChange={(e) => {
          const updatedNote = { ...localNote, title: e.target.value };
          setLocalNote(updatedNote);
        }}
      />
      <textarea
        className="w-full flex-1 bg-transparent resize-none border-none focus:outline-none font-lato text-black text-sm"
        placeholder="Description..."
        onClick={(e) => e.stopPropagation()}
        value={localNote.content}
        onChange={(e) => {
          const updatedNote = { ...localNote, content: e.target.value };
          setLocalNote(updatedNote);
        }}
      />
    </div>
  );
};

export default StickyNoteV2;
