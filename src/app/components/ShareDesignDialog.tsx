// src/app/components/ShareDesignDialog.tsx
'use client';
import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Snackbar, Alert, Divider, Typography, Box, } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { ShareDesignDialogProps, SharedUser } from '@/types';

export default function ShareDesignDialog({ open, designId, onClose, onShared, }: ShareDesignDialogProps) {
    const { token } = useAuth();
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState<'READ' | 'COMMENT' | 'WRITE'>('READ');
    const [sharedWith, setSharedWith] = useState<SharedUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        if (!open) {
            setEmail('');
            setPermission('READ');
            setLoading(false);
            setSharedWith([]);
        }

    }, [open]);

    // Load shared users
    useEffect(() => {
        if (!open || !designId || !token) return;

        const loadSharedUsers = async () => {
            try {
                const res = await fetch(`/api/designs/${designId}/shares`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) return;

                const data = await res.json();
                setSharedWith(data.shares || []);
            } catch (err) {
                console.error('Failed to load shared users', err);
            }
        };

        loadSharedUsers();
    }, [open, designId, token]);

    const handleShare = async () => {
        if (!email.trim()) {
            setSnackbar({
                open: true,
                message: 'Receiver email is required',
                severity: 'error',
            });
            return;
        }

        if (!designId) {
            setSnackbar({
                open: true,
                message: 'Design not selected',
                severity: 'error',
            });
            return;
        }

        try {
            setLoading(true);

            const res = await fetch(`/api/designs/${designId}/shares`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email,
                    permission,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to share design');
            }

            setSnackbar({
                open: true,
                message: 'Design shared successfully',
                severity: 'success',
            });

            setSharedWith((prev) => [
                ...prev,
                { email, permission },
            ]);

            setEmail('');
            setPermission('READ');

            onShared?.();

            setTimeout(() => {
                onClose();
            }, 500);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Failed to share design';

            setSnackbar({
                open: true,
                message,
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>Share Design</DialogTitle>

                <DialogContent>
                    <TextField
                        label="Receiver Email"
                        type="email"
                        fullWidth
                        margin="dense"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                    />

                    <TextField
                        select
                        label="Permission"
                        fullWidth
                        margin="dense"
                        value={permission}
                        onChange={(e) =>
                            setPermission(
                                e.target.value as
                                | 'READ'
                                | 'COMMENT'
                                | 'WRITE'
                            )
                        }
                    >
                        <MenuItem value="READ">Read</MenuItem>
                        <MenuItem value="COMMENT">Comment</MenuItem>
                        <MenuItem value="WRITE">Write</MenuItem>
                    </TextField>

                    {/* ---------- SHARED WITH LIST ---------- */}
                    {/* ---------- SHARED WITH LIST ---------- */}
                    {sharedWith.length > 0 && (
                        <>
                            <Divider sx={{ my: 2 }} />

                            <Typography
                                variant="subtitle2"
                                sx={{ mb: 1 }}
                            >
                                Shared with
                            </Typography>

                            {sharedWith.map((user) => (
                                <Box
                                    key={user.email}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        py: 0.5,
                                        fontSize: 14,
                                    }}
                                >
                                    <Typography component="span">{user.email}</Typography>
                                    <TextField
                                        select
                                        size="small"
                                        variant="standard"
                                        value={user.permission}
                                        onChange={async (e) => {
                                            const newPermission = e.target.value as 'READ' | 'COMMENT' | 'WRITE';
                                            try {
                                                const res = await fetch(`/api/designs/${designId}/shares`, {
                                                    method: 'PUT',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        Authorization: `Bearer ${token}`,
                                                    },
                                                    body: JSON.stringify({
                                                        email: user.email,
                                                        permission: newPermission,
                                                    }),
                                                });
                                                if (!res.ok) throw new Error('Failed to update');

                                                setSharedWith((prev) =>
                                                    prev.map((u) =>
                                                        u.email === user.email
                                                            ? { ...u, permission: newPermission }
                                                            : u
                                                    )
                                                );
                                                setSnackbar({ open: true, message: 'Permission updated', severity: 'success' });
                                            } catch {
                                                setSnackbar({ open: true, message: 'Failed to update permission', severity: 'error' });
                                            }
                                        }}
                                        sx={{ width: 100 }}
                                    >
                                        <MenuItem value="READ">Read</MenuItem>
                                        <MenuItem value="COMMENT">Comment</MenuItem>
                                        <MenuItem value="WRITE">Write</MenuItem>
                                    </TextField>
                                </Box>
                            ))}
                        </>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleShare}
                        disabled={loading}
                    >
                        Share
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() =>
                    setSnackbar((prev) => ({
                        ...prev,
                        open: false,
                    }))
                }
            >
                <Alert severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}
