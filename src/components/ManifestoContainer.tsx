import { Box, Divider, IconButton, Paper, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React from "react";
import useBoardStore from "../BoardStore";

const ManifestoContainer = () => {
  const { closeManifesto } = useBoardStore();
  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: "rgba(0, 0, 0, 0.3)",
          zIndex: 1200,
        }}
      />
      <Paper
        elevation={4}
        sx={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "66vw",
          height: "100vh",
          zIndex: 1300,
          overflowY: "auto",
          p: 3,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton
          onClick={closeManifesto}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box p={2}>
          <Typography variant="h2">Tech Tree</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1">
            This tool doesn't care about your workflow. That might seem harsh,
            but that's because most "work tracking" tools aren't very interested
            in how <i>humans</i> actually do work.
            <br />
            <br />
            Most work isn't done with a fixed plan. Even if a plan is made,
            plans change. Work tracking software, even for so-called "agile"
            workflows, isn't very helpful at making it easy to organize and
            re-organize work as your plans inevitably change.
            <br />
            <br />
          </Typography>
        </Box>
      </Paper>
    </>
  );
};

export default ManifestoContainer;
