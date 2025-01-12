import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import useBoardStore from "../BoardStore";
import { STICKY_COLORS } from "../constants";
import {
  Paper,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  Box,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
  alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import GridOnIcon from "@mui/icons-material/GridOn";
import PaletteIcon from "@mui/icons-material/Palette";
import { Numbers } from "@mui/icons-material";

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ isOpen, onClose }) => {
  const theme = useTheme();
  const { settings, changeSettings } = useBoardStore();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  const updateSettings = (updates: Partial<typeof settings>) => {
    const newSettings = {
      ...localSettings,
      ...updates,
    };
    setLocalSettings(newSettings);
    changeSettings(newSettings);
  };

  const handleColorChange = (colorName: string) => {
    const newColor = STICKY_COLORS.find((color) => color.name === colorName);
    if (newColor) {
      updateSettings({ defaultStickyColor: newColor });
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <Dialog
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          minWidth: 360,
          maxWidth: "90vw",
          m: 0,
        },
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Box>
          <Typography variant="h6" component="div">
            Settings
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Changes saved automatically
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: theme.palette.text.secondary,
            "&:hover": {
              backgroundColor: alpha(theme.palette.text.secondary, 0.1),
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <FormGroup sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={localSettings.confirmDeletes}
                onChange={(e) =>
                  updateSettings({ confirmDeletes: e.target.checked })
                }
                color="primary"
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <DeleteOutlineIcon
                  sx={{ color: theme.palette.text.secondary }}
                  fontSize="small"
                />
                <Typography variant="body2">
                  Confirm before deleting notes
                </Typography>
              </Box>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={localSettings.showGrid}
                onChange={(e) => updateSettings({ showGrid: e.target.checked })}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <GridOnIcon
                  sx={{ color: theme.palette.text.secondary }}
                  fontSize="small"
                />
                <Typography variant="body2">Show gridlines</Typography>
              </Box>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={localSettings.showPoints}
                onChange={(e) =>
                  updateSettings({ showPoints: e.target.checked })
                }
                color="primary"
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Numbers
                  sx={{ color: theme.palette.text.secondary }}
                  fontSize="small"
                />
                <Typography variant="body2">
                  Use Points Instead of T-Shirt Sizes
                </Typography>
              </Box>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={localSettings.createNewOnCanvasClick}
                onChange={(e) =>
                  updateSettings({ createNewOnCanvasClick: e.target.checked })
                }
                color="primary"
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Numbers
                  sx={{ color: theme.palette.text.secondary }}
                  fontSize="small"
                />
                <Typography variant="body2">
                  Create a new sticky when making a new connection and the board
                  is clicked.
                </Typography>
              </Box>
            }
          />
        </FormGroup>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <PaletteIcon
              sx={{ color: theme.palette.text.secondary }}
              fontSize="small"
            />
            <Typography
              variant="subtitle2"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 500,
              }}
            >
              Default Note Color
            </Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(40px, 1fr))",
              gap: 1,
            }}
          >
            {STICKY_COLORS.map((color) => (
              <Tooltip key={color.name} title={color.name}>
                <IconButton
                  onClick={() => handleColorChange(color.name)}
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: color.rawColor,
                    border:
                      localSettings.defaultStickyColor.name === color.name
                        ? `2px solid ${theme.palette.primary.main}`
                        : "2px solid transparent",
                    "&:hover": {
                      backgroundColor: alpha(color.rawColor, 0.8),
                      border: `2px solid ${theme.palette.primary.light}`,
                    },
                    transition: theme.transitions.create([
                      "border-color",
                      "background-color",
                    ]),
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>,
    document.body
  );
};

export default SettingsMenu;
