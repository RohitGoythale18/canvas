'use client';
import { useState, useEffect, useCallback } from "react";
import { Button, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Menu, MenuItem, ListItemIcon, ListItemText, Snackbar, Alert } from "@mui/material";
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';

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
    imageUrl: string; // Base64 encoded canvas image
    boardId: string;
    createdAt: string;
    order: number;
}

interface BoardsData {
    boards: Board[];
    currentBoardId: string | null;
}

interface BoardButtonProps {
    canvasData?: CanvasData;
    onLoadCanvas?: (canvasData: CanvasData) => void;
    getCurrentCanvasImage?: () => string; // Function to get current canvas as base64 image
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

    const loadBoards = useCallback(() => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                const parsedData: BoardsData = JSON.parse(data);
                setBoards(parsedData.boards || []);
                setCurrentBoardId(parsedData.currentBoardId || null);
            }
        } catch (error) {
            console.error("Error loading boards:", error);
            showSnackbar("Error loading boards", "error");
        }
    }, [showSnackbar]);

    const saveBoards = useCallback((updatedBoards: Board[], updatedCurrentBoardId: string | null = null) => {
        try {
            const data: BoardsData = {
                boards: updatedBoards,
                currentBoardId: updatedCurrentBoardId !== null ? updatedCurrentBoardId : currentBoardId
            };

            // Check storage quota (approx 5MB limit)
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

    // Load boards from localStorage on component mount
    useEffect(() => {
        loadBoards();
    }, [loadBoards]);

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

        // Get canvas image as base64
        const canvasImage = getCurrentCanvasImage();
        if (!canvasImage) {
            showSnackbar("Could not capture canvas image", "error");
            return;
        }

        const newPin: Pin = {
            id: `pin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: pinTitle,
            imageUrl: canvasImage,
            boardId: currentBoardId,
            createdAt: new Date().toISOString(),
            order: currentBoard.pins?.length ?? 0
        };

        const updatedBoards = boards.map(board => {
            if (board.id === currentBoardId) {
                return {
                    ...board,
                    pins: [...(board.pins || []), newPin]
                };
            }
            return board;
        });

        saveBoards(updatedBoards);
        setSaveDialogOpen(false);
        setPinTitle("");
        showSnackbar(`Design saved to "${currentBoard.name}"`, "success");
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
        if (onLoadCanvas) {
            // Here you would need to implement the logic to reconstruct the canvas state
            // from the saved data. This might require additional metadata storage.
            showSnackbar(`Loaded design: ${pin.title}`, "success");
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
                    <MenuItem
                        key={board.id}
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