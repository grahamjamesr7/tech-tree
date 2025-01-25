import { ButtonGroup, IconButton, Tooltip } from "@mui/material";
import { BoxSelectIcon, Keyboard, Plus } from "lucide-react";
import React, { ReactNode } from "react";
import useBoardStore, { EditMode } from "../../BoardStore";

interface Mode {
  tooltip: string;
  icon: ReactNode;
  mode: EditMode;
}

export default function GlobalToolbar() {
  const { editMode: currentMode, changeMode } = useBoardStore();

  const modes: Mode[] = [
    {
      tooltip: "(cmd + E) - Implementer/Worker Mode",
      icon: <Keyboard size={20} />,
      mode: "execute",
    },
    {
      tooltip: "(cmd + A) - Add/Edit Mode", 
      icon: <Plus size={20} />,
      mode: "add",
    },
    {
      tooltip: "(cmd + S) - Select/Arrange Mode",
      icon: <BoxSelectIcon size={20} />,
      mode: "arrange",
    },
  ];

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;

      switch (e.key.toLowerCase()) {
        case "e":
          changeMode("execute");
          break;
        case "a":
          e.preventDefault(); // Prevent select all
          changeMode("add");
          break;
        case "s":
          e.preventDefault(); // Prevent save dialog
          changeMode("arrange");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changeMode]);

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 border-2 border-slate-600 rounded-2xl p-2 shadow-lg"
    >
      <ButtonGroup
        sx={{
          "& .MuiButtonGroup-grouped": {
            borderRadius: "999px !important",
            minWidth: "3rem",
            padding: "0.5rem",
            border: "none",
            margin: "0 0.5rem",
            color: "white",
          },
          gap: "0.5rem",
        }}
        size="large"
      >
        {modes.map((m) => (
          <Tooltip title={m.tooltip} key={m.mode}>
            <IconButton
              sx={{
                borderRadius: "1rem",
                backgroundColor: currentMode == m.mode ? "rgb(51 65 85)" : "rgb(30 41 59)", // slate-700 : slate-800
                "&:hover": {
                  backgroundColor: "rgb(51 65 85)", // slate-700
                },
                "& svg": {
                  color: "white"
                }
              }}
              size="large"
              onClick={() => changeMode(m.mode)}
            >
              {m.icon}
            </IconButton>
          </Tooltip>
        ))}
      </ButtonGroup>
    </div>
  );
}
