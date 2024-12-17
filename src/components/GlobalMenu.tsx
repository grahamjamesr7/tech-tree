import React, { useState } from "react";
import { SpeedDial, SpeedDialAction } from "@mui/material";
import { Ellipsis, Settings2, Trash2 } from "lucide-react";
import useBoardStore from "../BoardStore";

interface GlobalMenuProps {
  setSettingsOpen: (open: boolean) => void;
}

const GlobalMenu: React.FC<GlobalMenuProps> = ({ setSettingsOpen }) => {
  const [armed, setArmed] = useState(false);
  const { clearBoard } = useBoardStore();
  return (
    <SpeedDial
      ariaLabel="Board actions"
      sx={{ position: "absolute", top: 16, left: 16 }}
      icon={<Ellipsis />}
      direction="down"
      onClick={(e) => e.stopPropagation()}
      FabProps={{
        color: "info",
      }}
    >
      <SpeedDialAction
        icon={<Trash2 size={20} />}
        tooltipTitle={armed ? "Are your sure?" : "Clear Board"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (armed) {
            clearBoard();
            setArmed(false);
          } else {
            setArmed(true);
          }
        }}
        tooltipOpen
        tooltipPlacement="right"
        FabProps={{
          color: armed ? "error" : "inherit",
        }}
      />
      <SpeedDialAction
        icon={<Settings2 size={20} />}
        tooltipTitle="Settings"
        onClick={(e) => {
          e.stopPropagation();
          setSettingsOpen(true);
        }}
        tooltipOpen
        tooltipPlacement="right"
      />
    </SpeedDial>
  );
};

export default GlobalMenu;
