'use client';
import { useState } from 'react';
import { LayerButtonProps } from '@/types';

import { Button, Menu, MenuItem, Tooltip, ListItemIcon, ListItemText } from '@mui/material';
import FlipToFrontIcon from '@mui/icons-material/FlipToFront';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';

export default function LayerButton({ onBringToFront, onBringForward, onSendBackward, onSendToBack, disabled = false, }: LayerButtonProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const open = Boolean(anchorEl);

    const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(e.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAction = (action: () => void) => {
        action();
        handleClose();
    };

    return (
        <>
            <Tooltip title="Layers" arrow>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={handleOpen}
                    disabled={disabled}
                >
                    <FlipToFrontIcon />
                </Button>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                <MenuItem onClick={() => handleAction(onBringToFront)}>
                    <ListItemIcon>
                        <VerticalAlignTopIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Bring to Front</ListItemText>
                </MenuItem>

                <MenuItem onClick={() => handleAction(onBringForward)}>
                    <ListItemIcon>
                        <ArrowUpwardIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Bring Forward</ListItemText>
                </MenuItem>

                <MenuItem onClick={() => handleAction(onSendBackward)}>
                    <ListItemIcon>
                        <ArrowDownwardIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Send Backward</ListItemText>
                </MenuItem>

                <MenuItem onClick={() => handleAction(onSendToBack)}>
                    <ListItemIcon>
                        <VerticalAlignBottomIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Send to Back</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
}
