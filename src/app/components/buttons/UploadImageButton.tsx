'use client';
import { useState, useRef } from "react";
import { UploadImageButtonProps } from "@/types";

import { Tooltip, Button, Menu, MenuItem, Divider } from "@mui/material";
import ImageIcon from '@mui/icons-material/Image';

const UploadImageButton = ({ onImageUpload }: UploadImageButtonProps) => {
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const openMenu = (e: React.MouseEvent<HTMLButtonElement>) => setMenuAnchor(e.currentTarget);
    const closeMenu = () => setMenuAnchor(null);

    const handleFileSelect = () => {
        fileInputRef.current?.click();
        closeMenu();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                onImageUpload?.(reader.result); // Base64
            }
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
            />

            <Tooltip title="Upload Image">
                <Button variant="outlined" onClick={openMenu} size="small">
                    <ImageIcon sx={{ fontSize: 20 }} />
                </Button>
            </Tooltip>

            <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
                <MenuItem disabled>Upload Image</MenuItem>
                <Divider />
                <MenuItem onClick={handleFileSelect}>From Device</MenuItem>
            </Menu>
        </>
    );
};

export default UploadImageButton;
