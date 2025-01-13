import { useEffect, useState } from "react";
import useBoardStore from "../BoardStore";
import { AUTOSAVE_MILLIS } from "../constants";
import React from "react";
import { Check, FileWarning, LoaderCircle } from "lucide-react";
import { Box, CircularProgress, Tooltip } from "@mui/material";

export default function Autosaver() {
  const { settings, saveBoard } = useBoardStore();
  const [success, setSuccess] = useState<boolean | undefined>(undefined);
  const [fakeLoading, setFakeLoading] = useState(false);

  useEffect(() => {
    if (!settings.enableAutoSave) {
      console.debug("Autosave disabled");
      return;
    }

    console.debug("Setting up autosave interval");

    const intervalId = setInterval(() => {
      try {
        setFakeLoading(true);
        setTimeout(() => setFakeLoading(false), 1000);
        const saveTime = saveBoard();
        setSuccess(saveTime !== undefined);
        console.debug("Autosave attempt at:", saveTime);
      } catch (error) {
        console.error("Autosave failed:", error);
        setSuccess(false);
      }
    }, AUTOSAVE_MILLIS);

    return () => {
      console.debug("Cleaning up autosave interval");
      clearInterval(intervalId);
    };
  }, [settings.enableAutoSave, saveBoard]);

  return (
    <Tooltip
      title="Tech Tree autosaves every 30s unless you disable in the settings."
      placement="right"
    >
      <Box position="fixed" top="1rem" left="5rem" zIndex={9999}>
        {fakeLoading ? (
          <CircularProgress size="1rem" />
        ) : success ? (
          <Check fontSize={24} color="green" />
        ) : (
          <FileWarning fontSize={24} color="red" />
        )}
      </Box>
    </Tooltip>
  );
}
