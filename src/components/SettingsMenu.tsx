import React from "react";
import ReactDOM from "react-dom";
import useBoardStore from "../BoardStore";
import { STICKY_COLORS } from "../constants";
import {
  Paper,
  Typography,
  FormControlLabel,
  Checkbox,
  IconButton,
  Box,
} from "@mui/material";
import { X } from "lucide-react";

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ isOpen, onClose }) => {
  const { settings, changeSettings } = useBoardStore();

  const handleConfirmDeletesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    changeSettings({
      ...settings,
      confirmDeletes: e.target.checked,
    });
  };

  const handleColorChange = (colorName: string) => {
    const newColor = STICKY_COLORS.find((color) => color.name === colorName);
    if (newColor) {
      changeSettings({
        ...settings,
        defaultStickyColor: newColor,
      });
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <Box
      sx={{
        position: "absolute",
        top: "60px",
        right: "20px",
        zIndex: 1000,
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Paper elevation={3} sx={{ p: 2, width: 300 }}>
        <div className="space-y-4">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Settings</Typography>
            <IconButton onClick={onClose} size="small">
              <X />
            </IconButton>
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={settings.confirmDeletes}
                onChange={handleConfirmDeletesChange}
                color="primary"
              />
            }
            label="Confirm before deleting notes"
          />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Default Note Color
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {STICKY_COLORS.map((color) => (
                <IconButton
                  key={color.name}
                  onClick={() => handleColorChange(color.name)}
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: color.rawColor,
                    border:
                      settings.defaultStickyColor.name === color.name
                        ? "2px solid #555"
                        : "none",
                    "&:hover": {
                      border: "2px solid #888",
                    },
                  }}
                  title={color.name}
                />
              ))}
            </Box>
          </Box>
        </div>
      </Paper>
    </Box>,
    document.body
  );
};

export default SettingsMenu;
