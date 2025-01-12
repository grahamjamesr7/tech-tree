import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  STICKY_COLORS,
  STICKY_SIZE_COPY_MAP,
  STICKY_SIZE_NUMERIC_MAP,
} from "../constants";
import useBoardStore, { STICKY_SIZES } from "../BoardStore";
import { Button, Tooltip } from "@mui/material";

interface StickyMenuProps {
  isVisible: boolean;
  id: number;
}

const StickyMenu: React.FC<StickyMenuProps> = ({ isVisible, id }) => {
  const { deleteNote, updateNote, splitNote, settings, notes } =
    useBoardStore();
  const thisNote = notes.find((i) => i.id === id)!;
  const [deletionArmed, setDeletionArmed] = useState(false);

  const handleColorChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    const curColor = STICKY_COLORS.findIndex(
      (c) => c.name === thisNote.color.name
    );
    updateNote({
      id: thisNote.id,
      color: STICKY_COLORS[(curColor + 1) % STICKY_COLORS.length],
    });
  };

  const handleSizeUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const sizes = Object.values(STICKY_SIZES);
    const newSize =
      thisNote.size === undefined
        ? STICKY_SIZES.trivial
        : thisNote.size === STICKY_SIZES.tooBig
        ? undefined
        : sizes[sizes.indexOf(thisNote.size) + 1];

    updateNote({ id, size: newSize });
  };

  return (
    <div
      className={`absolute -left-20 top-0 ml-5 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2 items-center">
        <Tooltip title="Delete Note" arrow placement="left">
          <button
            className="p-2 rounded hover:bg-red-50 text-black flex items-center justify-center"
            onClick={() =>
              settings.confirmDeletes && !deletionArmed
                ? setDeletionArmed(true)
                : deleteNote(id)
            }
          >
            <Trash2 size={16} className={deletionArmed ? "text-red-500" : ""} />
          </button>
        </Tooltip>
        <Tooltip title="Change color" arrow placement="left">
          <div
            className={`w-6 h-6 rounded-full ${thisNote.color.bgClass} hover:ring-2 ring-gray-400 cursor-pointer`}
            onClick={handleColorChange}
          />
        </Tooltip>
        <Tooltip title="Split" arrow placement="left">
          <Button
            variant="text"
            onClick={() => splitNote(id)}
            sx={{ minWidth: "2.25rem", padding: "0.5rem" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="4" width="16" height="6" rx="2" />
              <rect x="4" y="14" width="16" height="6" rx="2" />
              <path d="M12 10v4" />
            </svg>
          </Button>
        </Tooltip>
        <Tooltip title="Change Size" arrow placement="left">
          <Button
            variant="outlined"
            onClick={handleSizeUpdate}
            size="small"
            sx={{
              width: "2rem !important",
              minWidth: "2rem !important",
              minHeight: "2rem !important",
              height: "2rem !important",
              padding: "0.5rem",
              fontSize: 10,
              fontWeight: "bold",
            }}
          >
            {thisNote.size
              ? settings.showPoints
                ? STICKY_SIZE_NUMERIC_MAP[thisNote.size]
                : STICKY_SIZE_COPY_MAP[thisNote.size]
              : "-"}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default StickyMenu;
