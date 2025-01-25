import React, { useEffect, useState } from "react";
import useBoardStore, { Side } from "../../BoardStore";
import { Move } from "lucide-react";
import { adjustHexColor } from "../../utils";
import { ITEM_SIZE_COPY_MAP, ITEM_SIZE_NUMERIC_MAP } from "../../constants";
import EditStickyMenu from "./EditStickyMenu";
import WorkOnStickyMenu from "./WorkOnStickyMenu";

interface WorkItemProps {
  id: number;
  x: number;
  y: number;
}

const WorkItem: React.FC<WorkItemProps> = ({ id, x, y }) => {
  const {
    startConnection,
    activeConnection,
    cancelConnection,
    endConnection,
    updateNote,
    isEditing,
    changeIsEditing,
    notes,
    settings,
    editMode,
    currentPan,
    zoom,
  } = useBoardStore();

  const [isHovered, setIsHovered] = useState(false);
  const [showConn, setShowConn] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Calculate offset from the cursor to the note's center
    const noteX = x;
    const noteY = y;
    const cursorX = (e.clientX - currentPan.x) / zoom;
    const cursorY = (e.clientY - currentPan.y) / zoom;

    setDragOffset({
      x: noteX - cursorX,
      y: noteY - cursorY,
    });

    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      e.stopPropagation();

      // Calculate new position while maintaining the initial grab offset
      const cursorX = (e.clientX - currentPan.x) / zoom;
      const cursorY = (e.clientY - currentPan.y) / zoom;

      updateNote({
        id,
        x: cursorX + dragOffset.x,
        y: cursorY + dragOffset.y,
      });
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
  }, [isDragging, offset, id, updateNote, currentPan, zoom]);

  const thisNote = notes.find((i) => i.id == id)!;

  function changeHover(hover: boolean) {
    setIsHovered(hover);
    setShowConn(hover && editMode === "add");
  }

  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        changeIsEditing(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

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
    console.log("Current edit mode:", editMode);
  }, [editMode]);
  return (
    <div
      className={`absolute w-48 h-48 p-4 shadow-lg rounded-md font-lato flex flex-col
      ${isDragging ? "cursor-grabbing" : ""}
      ${activeConnection?.fromId == id ? "ring-2 ring-blue-500" : ""}
      bg-slate-800 border-2 border-slate-600`}
      onMouseEnter={() => changeHover(true)}
      onMouseLeave={() => changeHover(false)}
      style={{
        left: thisNote.x,
        top: thisNote.y,
        transform: "translate(-50%, -50%)",
        zIndex: isDragging ? 1000 : 1,
        cursor: isDragging ? "grabbing" : "auto",
        background: `linear-gradient(135deg, ${thisNote.color.rawColor}22 0%, ${thisNote.color.rawColor}44 100%)`,
        boxShadow: `0 0 20px ${thisNote.color.rawColor}22`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`connection-handle absolute top-0 left-1/2 w-4 h-4 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 
        border-2 border-slate-400 bg-slate-800 hover:border-blue-400 
        ${showConn ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
        onMouseDown={(e) => connectorClicked(e, "top")}
      />
      <div
        className={`connection-handle absolute top-1/2 right-0 w-4 h-4 rounded-full cursor-pointer transform translate-x-1/2 -translate-y-1/2 transition-all duration-200 
        border-2 border-slate-400 bg-slate-800 hover:border-blue-400
        ${showConn ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
        onMouseDown={(e) => connectorClicked(e, "right")}
      />
      <div
        className={`connection-handle absolute top-1/2 left-0 w-4 h-4 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 
        border-2 border-slate-400 bg-slate-800 hover:border-blue-400
        ${showConn ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
        onMouseDown={(e) => connectorClicked(e, "left")}
      />
      <div
        className={`connection-handle absolute bottom-0 left-1/2 w-4 h-4 rounded-full cursor-pointer transform -translate-x-1/2 translate-y-1/2 transition-all duration-200 
        border-2 border-slate-400 bg-slate-800 hover:border-blue-400
        ${showConn ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
        onMouseDown={(e) => connectorClicked(e, "bottom")}
      />

      <div
        className={`absolute -top-10 left-0 w-full transition-opacity ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        {editMode !== "execute" && (
          <>
            <div className="flex justify-between px-2">
              <button
                className={`px-2 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center border border-slate-500 ${
                  isDragging ? "cursor-grabbing" : "cursor-grab"
                }`}
                onMouseDown={handleMouseDown}
              >
                <Move size={16} />
              </button>
            </div>
            <EditStickyMenu id={id} isVisible={isHovered} />
          </>
        )}

        {editMode === "execute" && (
          <WorkOnStickyMenu noteId={id} isVisible={isHovered} />
        )}
      </div>

      <textarea
        className="w-full bg-transparent resize-none border-none focus:outline-none font-lato text-white font-bold text-lg mb-2"
        style={{
          height: "1.5rem",
          minHeight: "1.5rem",
          maxHeight: "3rem",
          lineHeight: "1.5rem",
          overflow: "hidden",
        }}
        disabled={editMode != "add"}
        placeholder="Title..."
        onClick={(e) => {
          e.stopPropagation();
          changeIsEditing(true);
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
          changeIsEditing(true);
          e.target.style.height = "1.5rem";
          const scrollHeight = Math.min(e.target.scrollHeight, 48);
          e.target.style.height = scrollHeight + "px";
        }}
      />

      <textarea
        className="w-full flex-1 bg-transparent resize-none border-none focus:outline-none font-lato text-white text-sm"
        placeholder="Description..."
        onClick={(e) => e.stopPropagation()}
        value={thisNote.content.summary}
        disabled={editMode != "add"}
        onChange={(e) => {
          updateNote({ id, content: { summary: e.target.value } });
          changeIsEditing(true);
        }}
      />

      {thisNote.size && !isEditing && (
        <div
          className={`absolute bottom-2 right-2 px-2 py-1 rounded-md bg-slate-900/50 text-sm`}
          style={{
            color: adjustHexColor(thisNote.color.rawColor, 0.2),
            fontWeight: 700,
            opacity: !isEditing ? 1 : 0,
            transition: "opacity 1s ease-in-out",
          }}
        >
          {settings.showPoints
            ? ITEM_SIZE_NUMERIC_MAP[thisNote.size]
            : ITEM_SIZE_COPY_MAP[thisNote.size]}
        </div>
      )}
    </div>
  );
};

export default WorkItem;
