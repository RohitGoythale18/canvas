'use client';

import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Snackbar,
    Alert,
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';

interface ShareDesignDialogProps {
    open: boolean;
    designId: string | null;
    onClose: () => void;
    onShared?: () => void;
}

export default function ShareDesignDialog({
    open,
    designId,
    onClose,
    onShared,
}: ShareDesignDialogProps) {
    const { token } = useAuth();

    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState<'READ' | 'COMMENT' | 'WRITE'>(
        'READ'
    );
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

    /* ================= RESET ON CLOSE ================= */
    useEffect(() => {
        if (!open) {
            setEmail('');
            setPermission('READ');
            setLoading(false);
        }
    }, [open]);

    /* ================= HANDLERS ================= */

    const handleShare = async () => {
        // ✅ Validate email
        if (!email.trim()) {
            setSnackbar({
                open: true,
                message: 'Receiver email is required',
                severity: 'error',
            });
            return;
        }

        // ✅ Validate designId
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

            onShared?.();

            // Close dialog AFTER success
            setTimeout(() => {
                onClose();
            }, 500);
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.message || 'Failed to share design',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    /* ================= UI ================= */

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="sm"
                fullWidth
            >
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
                                e.target.value as 'READ' | 'COMMENT' | 'WRITE'
                            )
                        }
                    >
                        <MenuItem value="READ">Read</MenuItem>
                        <MenuItem value="COMMENT">Comment</MenuItem>
                        <MenuItem value="WRITE">Write</MenuItem>
                    </TextField>
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

            {/* SNACKBAR */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() =>
                    setSnackbar((prev) => ({ ...prev, open: false }))
                }
            >
                <Alert severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}
