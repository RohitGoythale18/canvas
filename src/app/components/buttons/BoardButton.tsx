// src/app/components/buttons/BoardButton.tsx
'use client';
import React, { useCallback, useEffect, useState } from "react";
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
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import Image from "next/image";

import { CanvasData, Shape } from "../../../types";

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

interface BoardsData {
  boards: Board[];
  currentBoardId: string | null;
}

interface BoardButtonProps {
  canvasData?: CanvasData;
  onLoadCanvas?: (canvasData: CanvasData) => void;
  getCurrentCanvasImage?: () => string;
}

const STORAGE_KEY = "snapcanvas-boards";

const BoardButton = ({ canvasData, onLoadCanvas, getCurrentCanvasImage }: BoardButtonProps) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const [pinTitle, setPinTitle] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const showSnackbar = useCallback((message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const saveBoards = useCallback((updatedBoards: Board[], updatedCurrentBoardId: string | null = null) => {
    try {
      const data: BoardsData = {
        boards: updatedBoards,
        currentBoardId: updatedCurrentBoardId !== null ? updatedCurrentBoardId : currentBoardId
      };

      const dataString = JSON.stringify(data);
      const sizeInBytes = new Blob([dataString]).size;
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (sizeInBytes > maxSize) {
        showSnackbar("Storage limit exceeded. Please delete some boards.", "error");
        return;
      }

      localStorage.setItem(STORAGE_KEY, dataString);
      setBoards(updatedBoards);
      if (updatedCurrentBoardId !== null) {
        setCurrentBoardId(updatedCurrentBoardId);
      }
    } catch (error) {
      console.error("Error saving boards:", error);
      showSnackbar("Error saving boards", "error");
    }
  }, [currentBoardId, showSnackbar]);

  useEffect(() => {
    const loadBoards = () => {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
          const parsedData: BoardsData = JSON.parse(data);
          requestAnimationFrame(() => {
            setBoards(parsedData.boards || []);
            setCurrentBoardId(parsedData.currentBoardId || null);
          });
        }
      } catch (error) {
        console.error("Error loading boards:", error);
        setTimeout(() => {
          showSnackbar("Error loading boards", "error");
        }, 0);
      }
    };

    loadBoards();
  }, [showSnackbar]);

  const handleBoardMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleBoardMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateBoard = () => {
    if (!newBoardName.trim()) {
      showSnackbar("Board name is required", "error");
      return;
    }

    const newBoard: Board = {
      id: `board-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newBoardName,
      description: newBoardDescription,
      createdAt: new Date().toISOString(),
      pins: []
    };

    const updatedBoards = [...boards, newBoard];
    saveBoards(updatedBoards, newBoard.id);

    setCreateDialogOpen(false);
    setNewBoardName("");
    setNewBoardDescription("");
    showSnackbar(`Board "${newBoardName}" created successfully`, "success");
  };

  const handleSaveToBoard = () => {
    if (!currentBoardId || !getCurrentCanvasImage) {
      showSnackbar("No board selected or canvas not available", "error");
      return;
    }

    if (!pinTitle.trim()) {
      showSnackbar("Pin title is required", "error");
      return;
    }

    const currentBoard = boards.find(board => board.id === currentBoardId);
    if (!currentBoard) {
      showSnackbar("No board selected", "error");
      return;
    }

    const canvasImage = getCurrentCanvasImage();
    if (!canvasImage) {
      showSnackbar("Could not capture canvas image", "error");
      return;
    }

    const existingPinIndex = (currentBoard.pins || []).findIndex(pin => pin.title === pinTitle.trim());

    const canvasDataToSave: CanvasData = {
      shapes: canvasData?.shapes || [],
      backgroundColor: canvasData?.backgroundColor || { default: "#ffffff" },
      splitMode: canvasData?.splitMode || "none",
      drawings: canvasData?.drawings || [],
      filledImages: canvasData?.filledImages || [],
      uploadedImageUrl: canvasData?.uploadedImageUrl || null,
      loadedImageData: canvasData?.uploadedImageUrl || null,
      currentImageId: canvasData?.currentImageId || null
    };

    // Strip DOM-only props (imageElement) and normalize textual/font fields using Shape type
    canvasDataToSave.shapes = (canvasDataToSave.shapes as Shape[]).map((shape) => {
      // Destructure and keep imageElement into an intentionally unused var prefixed with _
      const { imageElement: _imageElement, ...rest } = shape as Shape & { imageElement?: HTMLImageElement };

      const normalized: Shape = {
        // basic shape props (rest should already have them)
        id: rest.id,
        type: rest.type,
        x: rest.x,
        y: rest.y,
        width: rest.width,
        height: rest.height,
        selected: rest.selected ?? false,
        panelId: rest.panelId ?? 'default',
        // optional visual props - preserve if present, otherwise undefined
        fillColor: rest.fillColor ?? undefined,
        imageUrl: rest.imageUrl ?? undefined,
        imageId: rest.imageId ?? undefined,
        borderType: rest.borderType ?? undefined,
        borderSize: rest.borderSize ?? undefined,
        borderColor: rest.borderColor ?? undefined,
        // Text / font props - ensure defaults exist so later rendering keeps styles
        text: rest.text ?? undefined,
        fontSize: rest.fontSize ?? 16,
        fontFamily: rest.fontFamily ?? "Arial, sans-serif",
        textColor: rest.textColor ?? "#000000",
        fontStyles: rest.fontStyles ?? { bold: false, italic: false, underline: false, strikethrough: false },
        isEditing: rest.isEditing ?? false,
        textAlignment: rest.textAlignment ?? "left",
        listType: rest.listType ?? "none"
      };

      return normalized;
    });

    const newPin: Pin = {
      id: existingPinIndex >= 0 ? (currentBoard.pins || [])[existingPinIndex].id : `pin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: pinTitle.trim(),
      imageUrl: canvasImage,
      canvasData: canvasDataToSave,
      boardId: currentBoardId,
      createdAt: existingPinIndex >= 0 ? (currentBoard.pins || [])[existingPinIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: existingPinIndex >= 0 ? (currentBoard.pins || [])[existingPinIndex].order : (currentBoard.pins?.length ?? 0)
    };

    const updatedBoards = boards.map(board => {
      if (board.id === currentBoardId) {
        const updatedPins = [...(board.pins || [])];
        if (existingPinIndex >= 0) {
          updatedPins[existingPinIndex] = newPin;
        } else {
          updatedPins.push(newPin);
        }
        return {
          ...board,
          pins: updatedPins
        };
      }
      return board;
    });

    saveBoards(updatedBoards);
    setSaveDialogOpen(false);
    setPinTitle("");
    showSnackbar(existingPinIndex >= 0 ? `Design updated in "${currentBoard.name}"` : `Design saved to "${currentBoard.name}"`, "success");
  };

  const handleSelectBoard = (boardId: string) => {
    saveBoards(boards, boardId);
    handleBoardMenuClose();
    showSnackbar(`Board selected successfully`, "success");
  };

  const handleDeleteBoard = (boardId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    const updatedBoards = boards.filter(board => board.id !== boardId);
    const newCurrentBoardId = currentBoardId === boardId ?
      (updatedBoards.length > 0 ? updatedBoards[0].id : null) :
      currentBoardId;

    saveBoards(updatedBoards, newCurrentBoardId);
    showSnackbar("Board deleted successfully", "success");
  };

  const handleLoadPin = (pin: Pin) => {
    if (onLoadCanvas && pin.canvasData) {
      onLoadCanvas(pin.canvasData);
      showSnackbar(`Loaded design: ${pin.title}`, "success");
    } else {
      showSnackbar("Could not load design - missing canvas data", "error");
    }
  };

  const getCurrentBoard = () => {
    return boards.find(board => board.id === currentBoardId);
  };

  return (
    <>
      <Tooltip title="Boards" arrow>
        <Button
          variant="outlined"
          onClick={handleBoardMenuOpen}
          size="small"
        >
          <DashboardIcon sx={{ fontSize: 20 }}>
            {getCurrentBoard()?.name}
          </DashboardIcon>
        </Button>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleBoardMenuClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: 300,
          },
        }}
      >
        <MenuItem onClick={() => { setCreateDialogOpen(true); handleBoardMenuClose(); }}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Create New Board</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => { setSaveDialogOpen(true); handleBoardMenuClose(); }}
          disabled={!currentBoardId || !getCurrentCanvasImage}
        >
          <ListItemIcon>
            <SaveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Save Current Design</ListItemText>
        </MenuItem>

        {boards.length > 0 && <hr className="my-1" />}

        {boards.map((board) => (
          <div key={board.id}>
            <MenuItem
              selected={board.id === currentBoardId}
              onClick={() => handleSelectBoard(board.id)}
              sx={{ justifyContent: 'space-between' }}
            >
              <div className="flex items-center">
                <FolderOpenIcon fontSize="small" sx={{ mr: 1 }} />
                <div className="flex flex-col">
                  <span className="font-medium">{board.name}</span>
                  <span className="text-xs text-gray-500">
                    {(board.pins || []).length} designs
                  </span>
                </div>
              </div>
              <Button
                size="small"
                color="error"
                onClick={(e) => handleDeleteBoard(board.id, e)}
                sx={{ minWidth: 'auto', p: 0.5 }}
              >
                <DeleteIcon fontSize="small" />
              </Button>
            </MenuItem>
            {/* Display pins for this board */}
            {(board.pins || []).map((pin) => (
              <MenuItem
                key={pin.id}
                onClick={() => handleLoadPin(pin)}
                sx={{ pl: 2, fontSize: '0.875rem' }}
              >
                <div className="flex items-center w-full">
                  <Image
                    src={pin.imageUrl}
                    alt={pin.title}
                    width={100}
                    height={100}
                    style={{
                      border: '1px solid black',
                      margin: 2,
                      marginRight: 8,
                      borderRadius: 4,
                      objectFit: 'cover'
                    }}
                  />
                  <span>{pin.title}</span>
                </div>
              </MenuItem>
            ))}
          </div>
        ))}

        {boards.length === 0 && (
          <MenuItem disabled>
            <ListItemText primary="No boards created yet" />
          </MenuItem>
        )}
      </Menu>

      {/* Create Board Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Board</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Board Name"
            fullWidth
            variant="outlined"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            variant="outlined"
            value={newBoardDescription}
            onChange={(e) => setNewBoardDescription(e.target.value)}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateBoard} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Save to Board Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Current Design</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Design Title"
            fullWidth
            variant="outlined"
            value={pinTitle}
            onChange={(e) => setPinTitle(e.target.value)}
            placeholder="Enter a title for this design"
          />
          <div className="mt-2 text-sm text-gray-600">
            Saving to: <strong>{getCurrentBoard()?.name}</strong>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveToBoard}
            variant="contained"
            disabled={!pinTitle.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BoardButton;
