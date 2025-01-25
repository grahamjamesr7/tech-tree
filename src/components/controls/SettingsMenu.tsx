import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import useBoardStore from "../../BoardStore";
import { STICKY_COLORS } from "../../constants";
import {
  Paper,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  Box,
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
import { Numbers, Rectangle, Save } from "@mui/icons-material";

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
          bgcolor: 'rgb(30 41 59)', // slate-800
          color: 'white',
          border: '1px solid rgb(71 85 105)', // slate-600
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
          borderBottom: '1px solid rgb(71 85 105)', // slate-600
        }}
      >
        <Box>
          <Typography variant="h6" component="div" sx={{ color: 'white' }}>
            Settings
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgb(148 163 184)' }}> {/* slate-400 */}
            Changes saved automatically
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'rgb(148 163 184)', // slate-400
            "&:hover": {
              backgroundColor: 'rgba(148, 163, 184, 0.1)',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <FormGroup sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={localSettings.confirmDeletes}
                onChange={(e) =>
                  updateSettings({ confirmDeletes: e.target.checked })
                }
                sx={{
                  color: 'rgb(148 163 184)', // slate-400
                  '&.Mui-checked': {
                    color: 'rgb(96 165 250)', // blue-400
                  }
                }}
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <DeleteOutlineIcon
                  sx={{ color: 'rgb(148 163 184)' }} // slate-400
                  fontSize="small"
                />
                <Typography variant="body2" sx={{ color: 'white' }}>
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
                sx={{
                  color: 'rgb(148 163 184)', // slate-400
                  '&.Mui-checked': {
                    color: 'rgb(96 165 250)', // blue-400
                  }
                }}
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <GridOnIcon
                  sx={{ color: 'rgb(148 163 184)' }} // slate-400
                  fontSize="small"
                />
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Show gridlines
                </Typography>
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
                sx={{
                  color: 'rgb(148 163 184)', // slate-400
                  '&.Mui-checked': {
                    color: 'rgb(96 165 250)', // blue-400
                  }
                }}
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Numbers
                  sx={{ color: 'rgb(148 163 184)' }} // slate-400
                  fontSize="small"
                />
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Use Points Instead of T-Shirt Sizes
                </Typography>
              </Box>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={localSettings.enableAutoSave}
                onChange={(e) =>
                  updateSettings({ enableAutoSave: e.target.checked })
                }
                sx={{
                  color: 'rgb(148 163 184)', // slate-400
                  '&.Mui-checked': {
                    color: 'rgb(96 165 250)', // blue-400
                  }
                }}
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Save
                  sx={{ color: 'rgb(148 163 184)' }} // slate-400
                  fontSize="small"
                />
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Enable Autosave
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
                sx={{
                  color: 'rgb(148 163 184)', // slate-400
                  '&.Mui-checked': {
                    color: 'rgb(96 165 250)', // blue-400
                  }
                }}
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Rectangle
                  sx={{ color: 'rgb(148 163 184)' }} // slate-400
                  fontSize="small"
                />
                <Typography variant="body2" sx={{ color: 'white' }}>
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
              sx={{ color: 'rgb(148 163 184)' }} // slate-400
              fontSize="small"
            />
            <Typography
              variant="subtitle2"
              sx={{
                color: 'rgb(148 163 184)', // slate-400
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
                        ? `2px solid rgb(96 165 250)` // blue-400
                        : "2px solid transparent",
                    "&:hover": {
                      backgroundColor: alpha(color.rawColor, 0.8),
                      border: `2px solid rgb(147 197 253)`, // blue-300
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
