'use client';

import React, { useState, useMemo } from 'react';
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
  Alert,
  Divider,
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';

import Image from 'next/image';
import { useBoards } from '@/hooks/useBoards';
import { CanvasData } from '@/types';

interface Props {
  canvasData?: CanvasData;
  onLoadCanvas?: (d: CanvasData) => void;
  getCurrentCanvasImage?: () => string;
  currentUserId?: string | null;
}

const BoardButton: React.FC<Props> = ({
  canvasData,
  onLoadCanvas,
  getCurrentCanvasImage,
  currentUserId,
}) => {
  const {
    boards,
    currentBoardId,
    setCurrentBoardId,
    effectiveUserId,
    loadingUser,
    snackbar,
    setSnackbar,
    createBoard,
    deleteBoard,
    saveDesignToBoard,
  } = useBoards(currentUserId);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openSave, setOpenSave] = useState(false);

  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');
  const [pinTitle, setPinTitle] = useState('');

  const disabled = loadingUser || !effectiveUserId;

  const handleSave = async () => {
    if (!currentBoardId || !getCurrentCanvasImage) {
      return setSnackbar({
        open: true,
        severity: 'error',
        message: 'No board selected',
      });
    }

    const img = getCurrentCanvasImage();
    if (!img) {
      return setSnackbar({
        open: true,
        severity: 'error',
        message: 'Canvas empty',
      });
    }

    const cloned: CanvasData = {
      shapes: canvasData?.shapes || [],
      drawings: canvasData?.drawings || [],
      filledImages: canvasData?.filledImages || [],
      backgroundColor: canvasData?.backgroundColor || { default: '#fff' },
      splitMode: canvasData?.splitMode || 'none',
      uploadedImageUrl: canvasData?.uploadedImageUrl || null,
      loadedImageData: canvasData?.loadedImageData || null,
      currentImageId: canvasData?.currentImageId ?? null,
      images: [],
    };

    cloned.images = [
      {
        id: `img_${Date.now()}`,
        mimeType: 'image/png',
        fileName: `thumb_${Date.now()}.png`,
        url: img,
        size: img.length,
        metadata: { createdBy: effectiveUserId, createdAt: new Date().toISOString() },
      },
    ];

    try {
      await saveDesignToBoard({
        boardId: currentBoardId,
        title: pinTitle,
        thumbnailUrl: img,
        canvasData: cloned,
      });

      setOpenSave(false);
      setPinTitle('');
    } catch {
      setSnackbar({ open: true, severity: 'error', message: 'An unexpected error occurred' });
    }
  };

  return (
    <>
      <Tooltip title="Boards">
        <Button
          variant="outlined"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          disabled={disabled}
          size="small"
        >
          <DashboardIcon sx={{ fontSize: 20 }} />
        </Button>
      </Tooltip>

      {/* MENU */}
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ style: { maxHeight: 400, width: 340 } }}
      >
        <MenuItem
          disabled={disabled}
          onClick={() => {
            setOpenCreate(true);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Create New Board</ListItemText>
        </MenuItem>

        <MenuItem
          disabled={!currentBoardId || disabled}
          onClick={() => {
            setOpenSave(true);
            setAnchorEl(null);
          }}
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
              onClick={() => {
                setCurrentBoardId(board.id);
                setAnchorEl(null);
                setSnackbar({
                  open: true,
                  severity: 'success',
                  message: 'Board selected',
                });
              }}
            >
              <FolderOpenIcon sx={{ mr: 1 }} />
              <div style={{ flexGrow: 1 }}>
                <div>{board.name}</div>
                <div style={{ fontSize: 12, color: '#888' }}>
                  {(board.pins || []).length} designs
                </div>
              </div>

              <Button
                size="small"
                color="error"
                sx={{ p: 0.4 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this board?')) deleteBoard(board.id);
                }}
              >
                <DeleteIcon fontSize="small" />
              </Button>
            </MenuItem>

            {(board.pins || []).map((p) => (
              <MenuItem
                key={p.id}
                sx={{ pl: 5 }}
                onClick={() => {
                  if (onLoadCanvas && p.canvasData) {
                    onLoadCanvas(p.canvasData);
                    setSnackbar({
                      open: true,
                      message: `Loaded: ${p.title}`,
                      severity: 'success',
                    });
                  }
                }}
              >
                <Image
                  src={p.imageUrl ?? ''}
                  alt={p.title}
                  width={80}
                  height={60}
                  style={{
                    objectFit: 'cover',
                    borderRadius: 4,
                    border: '1px solid #000',
                    marginRight: 8,
                  }}
                />
                {p.title}
              </MenuItem>
            ))}
            <Divider />
          </div>
        ))}
      </Menu>

      {/* CREATE DIALOG */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
        <DialogTitle>Create Board</DialogTitle>
        <DialogContent>
          <TextField
            label="Board Name"
            fullWidth
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Description"
            fullWidth
            sx={{ mt: 2 }}
            value={newBoardDesc}
            onChange={(e) => setNewBoardDesc(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                await createBoard(newBoardName, newBoardDesc);
                setNewBoardName('');
                setNewBoardDesc('');
                setOpenCreate(false);
              } catch {
                setSnackbar({
                  open: true,
                  severity: 'error',
                  message: 'An unexpected error occurred',
                });
              }
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* SAVE DIALOG */}
      <Dialog open={openSave} onClose={() => setOpenSave(false)}>
        <DialogTitle>Save Design</DialogTitle>
        <DialogContent>
          <TextField
            label="Design title"
            fullWidth
            sx={{ mt: 2 }}
            value={pinTitle}
            onChange={(e) => setPinTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSave(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
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
