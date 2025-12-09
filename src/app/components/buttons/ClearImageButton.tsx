// src/app/components/buttons/ClearImageButton.tsx
'use client';
import { Button, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

interface ClearImageButtonProps {
    currentImageId?: string | null;
    onClearImage?: () => void;
    onImageDeleted?: (deletedId: string) => void;
}

export default function ClearImageButton({ currentImageId, onClearImage, onImageDeleted }: ClearImageButtonProps) {
    const handleClick = async () => {
        const confirmDelete = window.confirm("Remove the image from the selected shape?");
        if (!confirmDelete) return;

        let deleteFromServer = false;
        if (currentImageId) {
            deleteFromServer = window.confirm("Also delete the stored image from the server (this cannot be undone)?");
        }

        if (deleteFromServer && currentImageId) {
            try {
                const res = await fetch(`/api/stored-images/${currentImageId}`, {
                    method: 'DELETE',
                    credentials: 'same-origin'
                });
                if (!res.ok) {
                    const text = await res.text();
                    console.warn('Server delete returned non-ok:', res.status, text);
                    alert('Failed to delete image on server. The shape will still be cleared locally.');
                } else {
                    onImageDeleted?.(currentImageId);
                }
            } catch (err) {
                console.error('Failed to delete stored image from server:', err);
                alert('Failed to delete image on server. See console.');
            }
        }

        onClearImage?.();
    };

    return (
        <Tooltip title="Clear Image" arrow>
            <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleClick}
            >
                <DeleteIcon sx={{ fontSize: 20 }} />
            </Button>
        </Tooltip>
    );
}
