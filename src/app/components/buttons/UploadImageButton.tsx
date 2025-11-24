'use client';
import { useState, useRef } from "react";
import { Tooltip, Button, Menu, MenuItem, Divider } from "@mui/material";
import ImageIcon from '@mui/icons-material/Image';
import { imageStorage } from '../../../lib/imageStorage';

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
        if (file) {
            try {
                const imageId = await imageStorage.storeImage(file);
                const blobUrl = URL.createObjectURL(file);

                localStorage.setItem('currentImageId', imageId);

                onImageUpload?.(blobUrl, imageId);
            } catch (error) {
                console.error('Error storing image:', error);
            }
        }
        event.target.value = '';
    };

    const handleUrlInput = () => {
        const url = prompt("Enter image URL:");
        if (url && url.trim()) {
            onImageUpload?.(url.trim());
        }
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
