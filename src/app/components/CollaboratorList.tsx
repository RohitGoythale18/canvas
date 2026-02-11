'use client';
import { Avatar, AvatarGroup, Box, Tooltip, Typography } from '@mui/material';

interface CollaboratorListProps {
    users: Map<number, any>;
}

export const CollaboratorList = ({ users }: CollaboratorListProps) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: 'gray', mr: 1 }}>
                Collaborators ({users.size})
            </Typography>
            <AvatarGroup max={4} sx={{
                '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.8rem', border: '2px solid #242424' }
            }}>
                {Array.from(users.entries()).map(([clientId, state]) => {
                    const { user } = state;
                    if (!user) return null;

                    return (
                        <Tooltip key={clientId} title={user.name} arrow>
                            <Avatar
                                sx={{ bgcolor: user.color }}
                                alt={user.name}
                            >
                                {user.name.charAt(0).toUpperCase()}
                            </Avatar>
                        </Tooltip>
                    );
                })}
            </AvatarGroup>
        </Box>
    );
};
