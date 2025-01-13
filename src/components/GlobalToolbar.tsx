import {
  Button,
  ButtonGroup,
  darken,
  IconButton,
  Paper,
  Tooltip,
} from "@mui/material";
import { BoxSelectIcon, Keyboard, Plus } from "lucide-react";
import React, { ReactNode } from "react";
import useBoardStore, { EditMode } from "../BoardStore";
import { STICKY_COLORS } from "../constants";

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
      icon: <Keyboard fontSize={24} />,
      mode: "execute",
    },
    {
      tooltip: "(cmd + A) - Add/Edit Mode",
      icon: <Plus fontSize={24} />,
      mode: "add",
    },
    {
      tooltip: "(cmd + S) - Select/Arrange Mode",
      icon: <BoxSelectIcon fontSize={24} />,
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
    <Paper
      elevation={1}
      sx={{
        borderRadius: "1rem",
        padding: "0.5rem",
        position: "fixed",
        top: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "white",
      }}
    >
      <ButtonGroup
        sx={{
          "& .MuiButtonGroup-grouped": {
            borderRadius: "999px !important",
            minWidth: "3rem",
            padding: "0.5rem",
            border: "none",
            margin: "0 0.5rem", // Increased from 0.25rem to 0.5rem
          },
          gap: "0.5rem", // Added gap property
        }}
        size="large"
      >
        {modes.map((m) => (
          <Tooltip title={m.tooltip}>
            <IconButton
              sx={{
                borderRadius: "1rem",
                backgroundColor:
                  currentMode == m.mode ? STICKY_COLORS[0].rawColor : "#f5f5f5",
                "&:hover": {
                  backgroundColor: darken(STICKY_COLORS[0].rawColor, 0.05),
                },
              }}
              size="large"
              onClick={() => changeMode(m.mode)}
            >
              {m.icon}
            </IconButton>
          </Tooltip>
        ))}
      </ButtonGroup>
    </Paper>
  );
}
