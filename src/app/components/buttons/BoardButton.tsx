'use client';
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert
} from "@mui/material";

import DashboardIcon from '@mui/icons-material/Dashboard';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';

import { CanvasData, Shape } from "../../../types";
import { useAuth } from "@/context/AuthContext";

interface Board {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  pins: Pin[] | undefined;
}

interface Pin {
  id: string;
  title: string;
  imageUrl: string;
  canvasData: CanvasData;
  boardId: string;
  createdAt: string;
  updatedAt?: string;
  order: number;
}

interface BoardButtonProps {
  canvasData?: CanvasData;
  onLoadCanvas?: (canvasData: CanvasData) => void;
  getCurrentCanvasImage?: () => string;
}

const BoardButton = ({
  canvasData,
  onLoadCanvas,
  getCurrentCanvasImage
}: BoardButtonProps) => {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();

  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
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
  const loadBoards = async () => {
    if (!isAuthenticated || !token) return;

    try {
      const res = await fetch("/api/boards", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();

      const data = await res.json();

      const normalized: Board[] = data.map((b: any) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        createdAt: b.createdAt,
        pins: (b.designs || []).map((d: any) => ({
          id: d.id,
          title: d.title,
          imageUrl: d.thumbnailUrl,
          canvasData: d.data,
          createdAt: d.createdAt,
        })),
      }));

      setBoards(normalized);
      if (!currentBoardId && normalized.length > 0) {
        setCurrentBoardId(normalized[0].id);
      }
    } catch {
      showSnackbar("Failed to load boards", "error");
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  // ================= CREATE BOARD =================
  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) {
      showSnackbar("Board name is required", "error");
      return;
    }

    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newBoardName,
          description: newBoardDescription,
        }),
      });

      if (!res.ok) throw new Error();

      setCreateDialogOpen(false);
      setNewBoardName("");
      setNewBoardDescription("");
      await loadBoards();

      showSnackbar("Board created successfully", "success");
    } catch {
      showSnackbar("Failed to create board", "error");
    }
  };

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
      ({ imageElement: _img, ...rest }: any) => ({
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

  const handleLoadPin = async (pin: Pin) => {
    try {
      // Load the design data from API
      const res = await fetch(`/api/design/${pin.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const design = await res.json();
        onLoadCanvas?.(design.data);
        showSnackbar(`Loaded: ${pin.title}`, "success");
      }
    } catch (error) {
      console.error("Failed to load pin:", error);
      showSnackbar("Failed to load design", "error");
    }
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
