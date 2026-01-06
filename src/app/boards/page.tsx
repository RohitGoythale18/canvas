// src/app/boards/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, Divider, List, ListItemButton, ListItemText, ListItemIcon, Collapse, ListItemAvatar, Avatar, IconButton, Menu, MenuItem, ListItemSecondaryAction, } from '@mui/material';

import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';

import { CanvasData } from '../../types';
import { useAuth } from '@/context/AuthContext';
import ShareDesignDialog from '../components/ShareDesignDialog';

interface BoardAPI {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  designs?: DesignAPI[];
}

interface DesignAPI {
  id: string;
  title: string;
  thumbnailUrl: string;
  data: CanvasData;
  createdAt: string;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
}

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
  createdAt: string;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function BoardsPage() {
  const { token, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const authUserId = user?.id;

  const [boards, setBoards] = useState<Board[]>([]);
  const [sharedDesigns, setSharedDesigns] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [openBoards, setOpenBoards] = useState<Record<string, boolean>>({});
  const [designMenuAnchor, setDesignMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const fetchBoards = React.useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch('/api/boards', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      const normalized: Board[] = (data as BoardAPI[]).map((b) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        createdAt: b.createdAt,
        pins: (b.designs ?? []).map((d) => ({
          id: d.id,
          title: d.title,
          imageUrl: d.thumbnailUrl,
          canvasData: d.data,
          createdAt: d.createdAt,
          ownerId: d.ownerId,
          owner: d.owner,
        })),
      }));

      setBoards(normalized);
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to load boards',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchSharedDesigns = React.useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch('/api/designs/shared', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setSharedDesigns(data);
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to load shared designs',
        severity: 'error',
      });
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    fetchBoards();
    fetchSharedDesigns();
  }, [isAuthenticated, fetchBoards, fetchSharedDesigns, router]);

  const toggleBoard = (boardId: string) => {
    setOpenBoards((prev) => ({
      ...prev,
      [boardId]: !prev[boardId],
    }));
  };

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) {
      setSnackbar({
        open: true,
        message: 'Board name is required',
        severity: 'error',
      });
      return;
    }

    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newBoardName,
          description: newBoardDescription,
        }),
      });

      if (!res.ok) throw new Error();

      setCreateDialogOpen(false);
      setNewBoardName('');
      setNewBoardDescription('');
      await fetchBoards();

      setSnackbar({
        open: true,
        message: 'Board created successfully',
        severity: 'success',
      });
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to create board',
        severity: 'error',
      });
    }
  };

  const handlePinClick = (pin: Pin) => {
    router.push(`/?designId=${pin.id}`);
  };

  const openDesignMenu = (e: React.MouseEvent<HTMLElement>, pin: Pin) => {
    e.stopPropagation();
    setDesignMenuAnchor(e.currentTarget);
    setSelectedPin(pin);
  };

  const closeDesignMenu = () => {
    setDesignMenuAnchor(null);
  };

  const handleShareDesign = () => {
    if (!selectedPin) return;
    setShareDialogOpen(true);
    closeDesignMenu();
  };

  const handleDeleteDesign = async () => {
    if (!selectedPin) return;

    if (selectedPin.ownerId !== authUserId) {
      setSnackbar({
        open: true,
        message: 'You are not the owner of this design',
        severity: 'error',
      });
      closeDesignMenu();
      return;
    }

    try {
      const res = await fetch(`/api/designs/${selectedPin.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 403) {
        setSnackbar({
          open: true,
          message: 'You do not have permission to delete this design',
          severity: 'error',
        });
        return;
      }

      if (!res.ok) throw new Error();

      setSnackbar({
        open: true,
        message: 'Design deleted successfully',
        severity: 'success',
      });

      await fetchBoards();
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to delete design',
        severity: 'error',
      });
    } finally {
      closeDesignMenu();
    }
  };

  if (loading) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h4">Loading boards...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'grey.900', minHeight: '100vh', color: 'white' }}>
      {/* HEADER */}
      <Box sx={{ p: 3, borderBottom: '1px solid grey.700' }}>
        <Typography variant="h5" fontWeight="bold">
          My Boards
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'primary.main', mx: 3 }} />

      {/* CREATE BOARD */}
      <Box sx={{ m: 3 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
          Create Board
        </Button>
      </Box>

      {/* BOARDS LIST */}
      <List sx={{ px: 3 }}>
        {boards.map((board) => {
          const isOpen = openBoards[board.id] || false;

          return (
            <Box key={board.id}>
              <ListItemButton onClick={() => toggleBoard(board.id)}>
                <ListItemIcon>
                  <FolderIcon sx={{ color: 'primary.main' }} />
                </ListItemIcon>

                <ListItemText
                  primary={board.name}
                  secondary={
                    <Typography component="span" sx={{ display: 'inline-flex', mt: 0.5 }}>
                      <Chip
                        label={`${(board.pins || []).length} designs`}
                        size="small"
                        color="secondary"
                      />
                    </Typography>
                  }
                />

                {isOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {(board.pins || []).map((pin) => (
                    <ListItemButton
                      key={pin.id}
                      sx={{ px: 9, gap: 2 }}
                      onClick={() => handlePinClick(pin)}
                    >
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          src={pin.imageUrl}
                          alt={pin.title}
                          sx={{ width: 100, height: 60 }}
                        />
                      </ListItemAvatar>

                      <ListItemText
                        primary={pin.title}
                        secondary={
                          <Box component="span">
                            <Typography variant="body2" component="span" sx={{ color: 'grey.300' }}>
                              by {pin.owner?.name || pin.owner?.email || 'Unknown'}
                            </Typography>
                            <br />
                            <Typography variant="body2" component="span" sx={{ color: 'grey.400' }}>
                              {new Date(pin.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                        primaryTypographyProps={{ sx: { color: 'white' } }}
                      />

                      <ListItemSecondaryAction onClick={(e) => e.stopPropagation()}>
                        <IconButton onClick={(e) => openDesignMenu(e, pin)}>
                          <MoreVertIcon sx={{ color: 'white' }} />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>

              <Divider sx={{ borderColor: 'grey.800' }} />
            </Box>
          );
        })}
      </List>

      {/* SHARED DESIGNS SECTION */}
      {sharedDesigns.length > 0 && (
        <>
          <Box sx={{ p: 3, borderBottom: '1px solid grey.700' }}>
            <Typography variant="h6" fontWeight="bold">
              Shared with Me
            </Typography>
          </Box>

          <Divider sx={{ borderColor: 'primary.main', mx: 3 }} />

          <List sx={{ px: 3 }}>
            {sharedDesigns.map((pin) => (
              <ListItemButton
                key={pin.id}
                sx={{ gap: 2 }}
                onClick={() => handlePinClick(pin)}
              >
                <ListItemAvatar>
                  <Avatar
                    variant="rounded"
                    src={pin.imageUrl}
                    alt={pin.title}
                    sx={{ width: 100, height: 60 }}
                  />
                </ListItemAvatar>

                <ListItemText
                  primary={pin.title}
                  secondary={
                    <Box component="span">
                      <Typography variant="body2" component="span" sx={{ color: 'grey.300' }}>
                        by {pin.owner?.name || pin.owner?.email || 'Unknown'}
                      </Typography>
                      <br />
                      <Typography variant="body2" component="span" sx={{ color: 'grey.400' }}>
                        {new Date(pin.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                  primaryTypographyProps={{ sx: { color: 'white' } }}
                />

                <ListItemSecondaryAction onClick={(e) => e.stopPropagation()}>
                  <IconButton onClick={(e) => openDesignMenu(e, pin)}>
                    <MoreVertIcon sx={{ color: 'white' }} />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItemButton>
            ))}
          </List>
        </>
      )}

      {/* DESIGN MENU */}
      <Menu anchorEl={designMenuAnchor} open={Boolean(designMenuAnchor)} onClose={closeDesignMenu}>
        <MenuItem onClick={handleShareDesign}>
          <ShareIcon fontSize="small" sx={{ mr: 1 }} />
          Share
        </MenuItem>
        <MenuItem onClick={handleDeleteDesign} disabled={selectedPin?.ownerId !== authUserId} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* SHARE DESIGN DIALOG */}
      <ShareDesignDialog
        open={shareDialogOpen}
        designId={selectedPin?.id || null}
        onClose={() => setShareDialogOpen(false)}
      />

      {/* CREATE BOARD DIALOG */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Board</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Board Name"
            fullWidth
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            value={newBoardDescription}
            onChange={(e) => setNewBoardDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateBoard}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
