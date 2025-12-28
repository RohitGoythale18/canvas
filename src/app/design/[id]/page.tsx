'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    MenuItem,
    Typography,
    Snackbar,
    Alert,
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';

export default function ShareDesignPage() {
    const { id } = useParams<{ id: string }>();
    const { token } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState('READ');
    const [snackbar, setSnackbar] = useState<any>(null);

    const handleShare = async () => {
        const res = await fetch(`/api/designs/${id}/shares`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email, permission }),
        });

        if (!res.ok) {
            const data = await res.json();
            setSnackbar({ msg: data.error, type: 'error' });
            return;
        }

        setSnackbar({ msg: 'Design shared successfully', type: 'success' });
        setTimeout(() => router.back(), 1000);
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 6 }}>
            <Typography variant="h6" mb={2}>
                Share Design
            </Typography>

            <TextField
                label="User Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
            />

            <TextField
                select
                label="Permission"
                fullWidth
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                sx={{ mb: 2 }}
            >
                <MenuItem value="READ">Read</MenuItem>
                <MenuItem value="COMMENT">Comment</MenuItem>
                <MenuItem value="WRITE">Write</MenuItem>
            </TextField>

            <Button variant="contained" fullWidth onClick={handleShare}>
                Share
            </Button>

            {snackbar && (
                <Snackbar open autoHideDuration={3000}>
                    <Alert severity={snackbar.type}>{snackbar.msg}</Alert>
                </Snackbar>
            )}
        </Box>
    );
}
