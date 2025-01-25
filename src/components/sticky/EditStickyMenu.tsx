import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  STICKY_COLORS,
} from "../../constants";
import useBoardStore from "../../BoardStore";
import { Button, Tooltip } from "@mui/material";
import StickyMenuContainer from "./StickyMenuContainer";

interface StickyMenuProps {
  isVisible: boolean;
  id: number;
}

const EditStickyMenu: React.FC<StickyMenuProps> = ({ isVisible, id }) => {
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

  return (
    <StickyMenuContainer isVisible={isVisible}>
      <Tooltip title="Delete Note" arrow placement="left">
        <button
          className="p-2 rounded hover:bg-red-900/30 text-white flex items-center justify-center bg-slate-800"
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
          className={`w-6 h-6 rounded-sm border border-slate-600 hover:ring-2 ring-slate-400 cursor-pointer`}
          onClick={handleColorChange}
          style={{ backgroundColor: thisNote.color.rawColor }}
        />
      </Tooltip>
      <Tooltip title="Split" arrow placement="left">
        <Button
          variant="text"
          onClick={() => splitNote(id)}
          sx={{ 
            minWidth: "2.25rem", 
            padding: "0.5rem",
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)"
            }
          }}
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
    </StickyMenuContainer>
  );
};

export default EditStickyMenu;
