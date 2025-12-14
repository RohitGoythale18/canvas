// src/app/components/buttons/BoardButton.tsx
'use client';

import React, { useState } from 'react';
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
  IconButton,
  List,
  ListItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import Image from 'next/image';
import { useBoards } from '@/hooks/useBoards';
import { CanvasData } from '@/types';

interface Props {
  canvasData?: CanvasData;
  onLoadCanvas?: (d: CanvasData) => void;
  getCurrentCanvasImage?: () => string;
  currentUserId?: string | null;
}

// IMPORTANT: `id` here is the SharedDesign record id
type SharedUser = {
  id: string; // share record id (SharedDesign.id)
  email: string;
  role: 'viewer' | 'editor';
};

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
    deleteDesign,
  } = useBoards(currentUserId);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openSave, setOpenSave] = useState(false);

  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');
  const [pinTitle, setPinTitle] = useState('');

  // Design (pin) action menu + share / manage access
  const [designMenuAnchor, setDesignMenuAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [selectedDesign, setSelectedDesign] = useState<{
    boardId: string;
    designId: string;
  } | null>(null);

  // Share URL for the design
  const [shareUrl, setShareUrl] = useState('');

  // Share dialog (email + list of users)
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);

  // Manage access dialog – for a specific user
  const [manageAccessOpen, setManageAccessOpen] = useState(false);
  const [selectedUserForAccess, setSelectedUserForAccess] =
    useState<SharedUser | null>(null);

  const disabled = loadingUser || !effectiveUserId;

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, severity, message });
  };

  // --- SHARE HELPERS -------------------------------------------------------

  // load all users that have access to this design
  const loadSharedUsers = async (designId: string) => {
    try {
      const res = await fetch(`/api/designs/${designId}/shares`, {
        method: 'GET',
        credentials: 'same-origin',
      });

      if (!res.ok) {
        console.error(await res.text());
        showSnackbar('Failed to load shared users', 'error');
        setSharedUsers([]);
        return;
      }

      const records: Array<{
        id: string;
        permission: string;
        sharedWith: { id: string; email: string | null };
      }> = await res.json();

      const normalized: SharedUser[] = (records || [])
        .filter((rec) => !!rec.sharedWith?.email)
        .map((rec) => ({
          id: rec.id, // share record id
          email: rec.sharedWith.email as string,
          role: rec.permission === 'WRITE' ? 'editor' : 'viewer',
        }));

      setSharedUsers(normalized);
    } catch (err) {
      console.error(err);
      showSnackbar('Failed to load shared users', 'error');
      setSharedUsers([]);
    }
  };

  const shareDesignWithEmail = async (designId: string, email: string) => {
    if (!effectiveUserId) {
      showSnackbar('No user available to share from', 'error');
      return null;
    }

    const res = await fetch(`/api/designs/${designId}/shares`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        email,
        role: 'viewer', // default; can be upgraded in manage access
        sharedById: effectiveUserId,
      }),
    });

    if (!res.ok) {
      console.error(await res.text());
      showSnackbar('Failed to share design', 'error');
      return null;
    }

    const rec: {
      id: string;
      permission: string;
      sharedWith: { id: string; email: string | null };
    } = await res.json();

    return rec;
  };

  const updateDesignPermission = async (
    designId: string,
    shareId: string,
    role: 'viewer' | 'editor',
  ) => {
    try {
      const res = await fetch(`/api/designs/${designId}/shares`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ shareId, role }),
      });

      if (!res.ok) {
        console.error(await res.text());
        showSnackbar('Failed to update permission', 'error');
        return;
      }

      // optional: read updated record, but we already updated local state
      await res.json();
      showSnackbar('Permission updated', 'success');
    } catch (err) {
      console.error(err);
      showSnackbar('Failed to update permission', 'error');
    }
  };

  // ------------------------------------------------------------------------

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
        metadata: {
          createdBy: effectiveUserId,
          createdAt: new Date().toISOString(),
        },
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
      setSnackbar({
        open: true,
        severity: 'error',
        message: 'An unexpected error occurred',
      });
    }
  };

  const handleOpenDesignMenu = (
    e: React.MouseEvent<HTMLElement>,
    boardId: string,
    designId: string,
  ) => {
    e.stopPropagation();
    setDesignMenuAnchor(e.currentTarget);
    setSelectedDesign({ boardId, designId });

    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/boards/${boardId}/designs/${designId}`;
      setShareUrl(url);
    }

    // load shared users for this design from your backend
    loadSharedUsers(designId);
  };

  const handleCloseDesignMenu = () => {
    setDesignMenuAnchor(null);
  };

  // Share clicked from design menu → open share dialog
  const handleShareDesign = () => {
    if (!selectedDesign) return;

    setShareEmail('');
    setShareDialogOpen(true);
    handleCloseDesignMenu();
  };

  const handleDeleteDesign = async () => {
    if (!selectedDesign) return;
    const confirmed = confirm('Delete this design?');
    if (!confirmed) return;

    try {
      await deleteDesign(selectedDesign.designId);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        severity: 'error',
        message: 'An unexpected error occurred',
      });
    } finally {
      handleCloseDesignMenu();
    }
  };

  const handleAddShareUser = async () => {
    if (!shareEmail.trim() || !selectedDesign) return;

    const email = shareEmail.trim();

    const rec = await shareDesignWithEmail(selectedDesign.designId, email);
    if (!rec) return;

    const role: 'viewer' | 'editor' =
      rec.permission === 'WRITE' ? 'editor' : 'viewer';

    setSharedUsers((prev) => {
      // avoid duplicate for same email
      if (prev.some((u) => u.email === email)) return prev;
      return [
        ...prev,
        {
          id: rec.id,
          email: email,
          role,
        },
      ];
    });

    setShareEmail('');
    setSnackbar({
      open: true,
      severity: 'success',
      message: 'Design shared successfully',
    });
  };

  const handleOpenManageAccess = (user: SharedUser) => {
    setSelectedUserForAccess(user);
    setManageAccessOpen(true);
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

      {/* BOARDS MENU */}
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ style: { maxHeight: 400, width: 360 } }}
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

        {boards.length > 0 && <Divider />}

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
                <div
                  style={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <span>{p.title}</span>
                  <span style={{ fontSize: 11, color: '#888' }}>
                    Click to load
                  </span>
                </div>

                <IconButton
                  size="small"
                  onClick={(e) => handleOpenDesignMenu(e, board.id, p.id)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </MenuItem>
            ))}
            <Divider />
          </div>
        ))}
      </Menu>

      {/* DESIGN ACTION MENU (Share / Delete) */}
      <Menu
        anchorEl={designMenuAnchor}
        open={!!designMenuAnchor}
        onClose={handleCloseDesignMenu}
      >
        <MenuItem onClick={handleShareDesign}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleDeleteDesign}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* SHARE DIALOG – email + list of users */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share design</DialogTitle>
        <DialogContent>
          <TextField
            label="Enter email to share with"
            fullWidth
            sx={{ mt: 2 }}
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
          />
          <Button sx={{ mt: 2 }} variant="contained" onClick={handleAddShareUser}>
            Share
          </Button>

          <Divider sx={{ mt: 3, mb: 1 }} />

          <p style={{ fontSize: 14, marginTop: 8, marginBottom: 4 }}>
            People with access:
          </p>

          <List sx={{ maxHeight: 200, overflowY: 'auto' }}>
            {sharedUsers.length === 0 && (
              <ListItem>
                <ListItemText primary="No one has access yet." />
              </ListItem>
            )}

            {sharedUsers.map((user) => (
              <ListItem
                key={user.id}
                sx={{ cursor: 'pointer' }}
                onClick={() => handleOpenManageAccess(user)}
              >
                <ListItemIcon>
                  <ManageAccountsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={user.email}
                  secondary={user.role === 'editor' ? 'Editor' : 'Viewer'}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* MANAGE ACCESS DIALOG – per user, with Viewer / Editor */}
      <Dialog
        open={manageAccessOpen}
        onClose={() => setManageAccessOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Manage access
          {selectedUserForAccess ? ` for ${selectedUserForAccess.email}` : ''}
        </DialogTitle>
        <DialogContent>
          <p style={{ fontSize: 14, marginTop: 8 }}>
            Share this link with {selectedUserForAccess?.email} if you want them
            to open this design directly.
          </p>
          <TextField
            label="Share link"
            fullWidth
            sx={{ mt: 2 }}
            value={shareUrl}
            InputProps={{ readOnly: true }}
          />
          <Button
            sx={{ mt: 2 }}
            variant="outlined"
            onClick={async () => {
              try {
                if (navigator.clipboard) {
                  await navigator.clipboard.writeText(shareUrl);
                  setSnackbar({
                    open: true,
                    severity: 'success',
                    message: 'Link copied to clipboard',
                  });
                } else {
                  setSnackbar({
                    open: true,
                    severity: 'error',
                    message: 'Clipboard not supported',
                  });
                }
              } catch (err) {
                console.error(err);
                setSnackbar({
                  open: true,
                  severity: 'error',
                  message: 'Failed to copy link',
                });
              }
            }}
          >
            Copy link
          </Button>
        </DialogContent>

        {/* Viewer / Editor permissions */}
        <FormControl sx={{ mt: 3, paddingX: 3 }}>
          <FormLabel>Permission</FormLabel>
          <RadioGroup
            value={selectedUserForAccess?.role ?? 'viewer'}
            onChange={(e) => {
              const newRole = e.target.value as 'viewer' | 'editor';
              if (!selectedUserForAccess) return;

              const shareId = selectedUserForAccess.id;

              // update local state immediately
              setSelectedUserForAccess((prev) =>
                prev ? { ...prev, role: newRole } : prev,
              );

              setSharedUsers((prev) =>
                prev.map((u) =>
                  u.id === shareId ? { ...u, role: newRole } : u,
                ),
              );

              // persist to backend
              if (selectedDesign) {
                updateDesignPermission(
                  selectedDesign.designId,
                  shareId,
                  newRole,
                );
              }
            }}
          >
            <FormControlLabel
              value="viewer"
              control={<Radio />}
              label="Viewer (can view only)"
            />
            <FormControlLabel
              value="editor"
              control={<Radio />}
              label="Editor (can edit)"
            />
          </RadioGroup>
        </FormControl>
        <DialogActions>
          <Button onClick={() => setManageAccessOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* CREATE BOARD DIALOG */}
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

      {/* SAVE DESIGN DIALOG */}
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
