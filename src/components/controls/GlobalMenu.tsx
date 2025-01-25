import React, { useState } from "react";
import { SpeedDial, SpeedDialAction } from "@mui/material";
import {
  Ellipsis,
  Save,
  Settings2,
  Trash2,
  Check,
  Newspaper,
} from "lucide-react";
import useBoardStore from "../../BoardStore";

interface GlobalMenuProps {
  setSettingsOpen: (open: boolean) => void;
}

const GlobalMenu: React.FC<GlobalMenuProps> = ({ setSettingsOpen }) => {
  const [armed, setArmed] = useState(false);
  const { clearBoard, saveBoard, openManifesto } = useBoardStore();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveBoard();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 1500);
  };

  return (
    <SpeedDial
      ariaLabel="Board actions"
      sx={{ 
        position: "absolute", 
        top: 16, 
        left: 16,
        "& .MuiSpeedDial-fab": {
          bgcolor: "rgb(30 41 59)", // slate-800
          color: "white",
          border: "2px solid rgb(71 85 105)", // slate-600
          "&:hover": {
            bgcolor: "rgb(51 65 85)", // slate-700
          }
        }
      }}
      icon={<Ellipsis />}
      direction="down"
      onClick={(e) => e.stopPropagation()}
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
            bgcolor: "rgb(30 41 59)", // slate-800
            color: "white",
          },
        }}
        FabProps={{
          sx: {
            bgcolor: armed ? "rgb(239 68 68)" : "rgb(30 41 59)", // red-500 : slate-800
            color: "white",
            border: "2px solid rgb(71 85 105)", // slate-600
            "&:hover": {
              bgcolor: armed ? "rgb(220 38 38)" : "rgb(51 65 85)", // red-600 : slate-700
            },
          },
        }}
      />
      <SpeedDialAction
        icon={saveSuccess ? <Check size={20} /> : <Save size={20} />}
        tooltipTitle="Save Board"
        onClick={handleSave}
        tooltipOpen
        tooltipPlacement="right"
        sx={{
          "& .MuiSpeedDialAction-staticTooltipLabel": {
            bgcolor: "rgb(30 41 59)", // slate-800
            color: "white",
          }
        }}
        FabProps={{
          sx: {
            bgcolor: saveSuccess ? "rgb(34 197 94)" : "rgb(30 41 59)", // green-500 : slate-800
            color: "white",
            border: "2px solid rgb(71 85 105)", // slate-600
            "&:hover": {
              bgcolor: saveSuccess ? "rgb(22 163 74)" : "rgb(51 65 85)", // green-600 : slate-700
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
        sx={{
          "& .MuiSpeedDialAction-staticTooltipLabel": {
            bgcolor: "rgb(30 41 59)", // slate-800
            color: "white",
          }
        }}
        FabProps={{
          sx: {
            bgcolor: "rgb(30 41 59)", // slate-800
            color: "white", 
            border: "2px solid rgb(71 85 105)", // slate-600
            "&:hover": {
              bgcolor: "rgb(51 65 85)", // slate-700
            },
          },
        }}
      />
      {/* <SpeedDialAction
        icon={<Newspaper size={20} />}
        tooltipTitle="Read Manifesto"
        onClick={(e) => {
          e.stopPropagation();
          openManifesto();
        }}
        tooltipOpen
        tooltipPlacement="right"
      /> */}
    </SpeedDial>
  );
};

export default GlobalMenu;
