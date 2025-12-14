'use client';
import { useState, useRef } from "react";
import { Tooltip, Button, Menu, MenuItem, Divider } from "@mui/material";
import ImageIcon from '@mui/icons-material/Image';

interface UploadImageButtonProps {
    active?: boolean;
    onImageUpload?: (imageUrl: string, imageId?: string) => void;
    onImageUsed?: () => void;
}

const UploadImageButton = ({ onImageUpload }: UploadImageButtonProps) => {
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMenuAnchor(event.currentTarget);
    };

    const closeMenu = () => {
        setMenuAnchor(null);
    };

    const handleFileSelect = () => {
        fileInputRef.current?.click();
        closeMenu();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            if (event.target) event.target.value = '';
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string; // data URL
                onImageUpload?.(result, undefined);
            };
            reader.onerror = (e) => {
                console.error('FileReader error', e);
                alert('Failed to read file.');
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error handling file change', error);
            alert('Error processing image file.');
        } finally {
            if (event.target) event.target.value = '';
        }
    };

    const handleUrlInput = async () => {
        const url = prompt("Enter image URL:");
        if (!url || !url.trim()) {
            closeMenu();
            return;
        }
        const trimmed = url.trim();
        onImageUpload?.(trimmed, undefined);
        closeMenu();
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
            />

            <Tooltip title="Upload Image" arrow>
                <Button variant="outlined" onClick={openMenu} size="small">
                    <ImageIcon sx={{ fontSize: 20 }} />
                </Button>
            </Tooltip>

            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
                <MenuItem disabled>Upload Image</MenuItem>
                <Divider />
                <MenuItem onClick={handleFileSelect}>From Device</MenuItem>
                <MenuItem onClick={handleUrlInput}>From URL</MenuItem>
            </Menu>
        </>
    );
};

export default UploadImageButton;
