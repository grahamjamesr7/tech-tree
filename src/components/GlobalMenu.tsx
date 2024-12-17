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
        tooltipTitle={armed ? "Are you sure?" : "Clear Board"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (armed) {
            clearBoard();
            setArmed(false);
          } else {
            setArmed(true);
            setTimeout(() => {
              setArmed(false);
            }, 3500);
          }
        }}
        tooltipOpen
        tooltipPlacement="right"
        sx={{
          "& .MuiSpeedDialAction-staticTooltipLabel": {
            minWidth: "120px",
            textAlign: "center",
          },
        }}
        FabProps={{
          sx: {
            bgcolor: armed ? "error.main" : "background.paper",
            color: armed ? "white" : "black",
            "&:hover": {
              bgcolor: armed ? "error.dark" : "background.default",
            },
          },
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
