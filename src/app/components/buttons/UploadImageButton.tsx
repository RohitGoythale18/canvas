'use client';
import { useState, useRef } from "react";
import { UploadImageButtonProps } from "@/types";

import { Tooltip, Button, Menu, MenuItem, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import ImageIcon from '@mui/icons-material/Image';

const UploadImageButton = ({ onImageUpload, onImageUploadByUrl }: UploadImageButtonProps) => {
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [urlDialogOpen, setUrlDialogOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const openMenu = (e: React.MouseEvent<HTMLButtonElement>) => setMenuAnchor(e.currentTarget);
    const closeMenu = () => setMenuAnchor(null);

    const handleFileSelect = () => {
        fileInputRef.current?.click();
        closeMenu();
    };

    const handleUrlSelect = () => {
        setUrlDialogOpen(true);
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

    const handleUrlSubmit = () => {
        if (imageUrl.trim()) {
            onImageUploadByUrl?.(imageUrl.trim());
            setImageUrl("");
            setUrlDialogOpen(false);
        }
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
                <MenuItem onClick={handleUrlSelect}>From URL</MenuItem>
            </Menu>

            <Dialog open={urlDialogOpen} onClose={() => setUrlDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Insert Image from URL</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Image URL"
                        type="url"
                        fullWidth
                        variant="outlined"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.png"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUrlDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleUrlSubmit} variant="contained" color="primary">Insert</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default UploadImageButton;
