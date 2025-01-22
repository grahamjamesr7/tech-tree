import { Button, Tooltip } from "@mui/material";
import useBoardStore, { STICKY_STATUSES } from "../../BoardStore";
import StickyMenuContainer from "./StickyMenuContainer";
import React from "react";

export default function WorkOnStickyMenu({
  isVisible,
  noteId,
}: {
  isVisible: boolean;
  noteId: number;
}) {
  const { updateNote, notes } = useBoardStore();
  const thisNote = notes.find((n) => n.id === noteId)!;
  function handleStatusUpdate(e: React.MouseEvent) {
    e.stopPropagation();
    const statuses = Object.values(STICKY_STATUSES);
    const newStatus = statuses[statuses.indexOf(thisNote.status) + 1];

    updateNote({ id: thisNote.id, status: newStatus });
  }
  return (
    <StickyMenuContainer isVisible={isVisible}>
      <Tooltip title="Change Size" arrow placement="left">
        <Button
          variant="outlined"
          onClick={handleStatusUpdate}
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
          {thisNote.status.charAt(0)}
        </Button>
      </Tooltip>
    </StickyMenuContainer>
  );
}
