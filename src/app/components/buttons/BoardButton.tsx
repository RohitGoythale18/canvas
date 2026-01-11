'use client';
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import { Button, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Menu, MenuItem, ListItemIcon, ListItemText, Snackbar, Alert } from "@mui/material";
import DashboardIcon from '@mui/icons-material/Dashboard';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { BoardAPI, BoardButtonProps, Shape } from "@/types";

const BoardButton = ({ canvasData, getCurrentCanvasImage }: BoardButtonProps) => {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();

  const [boards, setBoards] = useState<BoardAPI[]>([]);
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [pinTitle, setPinTitle] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const showSnackbar = useCallback(
    (message: string, severity: "success" | "error") => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  // ================= LOAD BOARDS =================
  const loadBoards = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    try {
      const res = await fetch("/api/boards", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      const normalized: BoardAPI[] = (data as BoardAPI[]).map((b) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        createdAt: b.createdAt,
        designs: (b.designs ?? []).map((d) => ({
          id: d.id,
          title: d.title,
          thumbnailUrl: d.thumbnailUrl,
          data: d.data,
          createdAt: d.createdAt,
          ownerId: d.ownerId,
          owner: d.owner,
        })),
      }));


      setBoards(normalized);

      if (!currentBoardId && normalized.length > 0) {
        setCurrentBoardId(normalized[0].id);
      }
    } catch {
      showSnackbar("Failed to load boards", "error");
    }
  }, [isAuthenticated, token, currentBoardId, showSnackbar]);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  // ================= SAVE DESIGN =================
  const handleSaveToBoard = async () => {
    if (!currentBoardId || !canvasData || !getCurrentCanvasImage) {
      showSnackbar("No board selected or canvas missing", "error");
      return;
    }

    if (!pinTitle.trim()) {
      showSnackbar("Design title required", "error");
      return;
    }

    const canvasImage = getCurrentCanvasImage();
    if (!canvasImage) {
      showSnackbar("Failed to capture canvas", "error");
      return;
    }

    const cleanedShapes = (canvasData.shapes as Shape[]).map(
      ({ imageElement: _img, ...rest }: Shape) => ({
        ...rest,
        fontSize: rest.fontSize ?? 16,
        fontFamily: rest.fontFamily ?? "Arial, sans-serif",
        textColor: rest.textColor ?? "#000000",
        fontStyles:
          rest.fontStyles ?? {
            bold: false,
            italic: false,
            underline: false,
            strikethrough: false,
          },
        textAlignment: rest.textAlignment ?? "left",
        listType: rest.listType ?? "none",
      })
    );

    try {
      const res = await fetch("/api/designs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: pinTitle,
          boardId: currentBoardId,
          data: { ...canvasData, shapes: cleanedShapes },
          thumbnailUrl: canvasImage,
        }),
      });

      if (!res.ok) throw new Error();

      setSaveDialogOpen(false);
      setPinTitle("");
      await loadBoards();

      showSnackbar("Design saved successfully", "success");
    } catch {
      showSnackbar("Failed to save design", "error");
    }
  };

  // ================= MENU HANDLERS =================
  const handleBoardMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleBoardMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSelectBoard = (boardId: string) => {
    setCurrentBoardId(boardId);
    handleBoardMenuClose();
    showSnackbar("Board selected", "success");
  };

  // ================= RENDER =================
  return (
    <>
      {/* BOARD BUTTON */}
      <Tooltip title="Boards" arrow>
        <Button
          variant="outlined"
          size="small"
          onClick={handleBoardMenuOpen}
        >
          <DashboardIcon sx={{ fontSize: 20 }} />
        </Button>
      </Tooltip>

      {/* MENU */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleBoardMenuClose}>
        <MenuItem
          onClick={() => {
            handleBoardMenuClose();
            router.push("/boards");
          }}
        >
          <ListItemIcon>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Boards</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setSaveDialogOpen(true);
            handleBoardMenuClose();
          }}
          disabled={!currentBoardId || !getCurrentCanvasImage}
        >
          <ListItemIcon>
            <SaveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Save Current Design</ListItemText>
        </MenuItem>

        {boards.map((board) => (
          <MenuItem
            key={board.id}
            selected={board.id === currentBoardId}
            onClick={() => handleSelectBoard(board.id)}
          >
            <FolderOpenIcon fontSize="small" sx={{ mr: 1 }} />
            {board.name}
          </MenuItem>
        ))}
      </Menu>

      {/* SAVE DIALOG */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Current Design</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Design Title"
            value={pinTitle}
            onChange={(e) => setPinTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveToBoard}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

export default BoardButton;
