'use client';
import React from 'react'; // Added React import for Fragment
import { Box, Tooltip, Typography } from '@mui/material';
import NavigationIcon from '@mui/icons-material/Navigation';
import { Shape } from '@/types'; // Added import for Shape

interface RemoteCursorsProps {
    users: Map<number, any>;
    panelId: string;
    shapes: Shape[];
    clientId?: number;
}

export const RemoteCursors = ({ users, panelId, shapes, clientId }: RemoteCursorsProps) => {
    return (
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }}>
            {Array.from(users.entries()).map(([currentClientId, state]) => {
                if (currentClientId === clientId) return null;
                const { user, cursor, selection } = state;

                // Render selection box
                const selectedShape = selection ? shapes.find(s => s.id === selection && s.panelId === panelId) : null;
                const selectionBox = selectedShape ? (
                    <Box
                        key={`selection-${currentClientId}`}
                        sx={{
                            position: 'absolute',
                            left: selectedShape.x,
                            top: selectedShape.y,
                            width: selectedShape.width,
                            height: selectedShape.height,
                            border: `2px solid ${user?.color || '#000'}`,
                            boxShadow: `0 0 10px ${user?.color || '#000'}`,
                            pointerEvents: 'none',
                            zIndex: 9998,
                        }}
                    >
                        <Box sx={{
                            position: 'absolute',
                            top: -20,
                            left: 0,
                            bgcolor: user?.color || '#000',
                            px: 0.5,
                            borderRadius: '4px 4px 0 0',
                        }}>
                            <Typography sx={{ fontSize: 20, color: 'white', whiteSpace: 'nowrap' }}>
                                {user?.name || 'Collaborator'} is editing
                            </Typography>
                        </Box>
                    </Box>
                ) : null;

                // Render cursor
                const remoteCursor = cursor && cursor.panelId === panelId ? (
                    <Box
                        key={`cursor-${currentClientId}`} // Changed key
                        sx={{
                            position: 'absolute',
                            left: cursor.x,
                            top: cursor.y,
                            transition: 'all 0.1s linear',
                            zIndex: 9999,
                        }}
                    >
                        <NavigationIcon sx={{ color: user?.color || '#000', fontSize: 20, transform: 'rotate(-90deg) translate(-25%, -25%)' }} />
                        {user?.name && (
                            <Box sx={{
                                ml: 1,
                                px: 0.5,
                                bgcolor: user.color,
                                borderRadius: 1,
                                opacity: 0.8,
                            }}>
                                <Typography sx={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>
                                    {user.name}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                ) : null;

                return (
                    <React.Fragment key={currentClientId}>
                        {selectionBox}
                        {remoteCursor}
                    </React.Fragment>
                );
            })}
        </Box>
    );
};
