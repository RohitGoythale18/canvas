// src/app/components/ExportButton.tsx
'use client';
import { useState } from "react";
import { Button, Menu as MuiMenu, MenuItem, Tooltip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";

interface ExportButtonProps {
    targetId?: string; // default to "main-canvas"
}

const ExportButton = ({ targetId = "main-canvas" }: ExportButtonProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleExportPNG = async () => {
        const node = document.getElementById(targetId);
        if (!node) {
            alert("Main canvas not found!");
            return;
        }

        try {
            // Temporarily remove scale to export at full size
            const originalTransform = node.style.transform;
            const originalOrigin = node.style.transformOrigin;

            node.style.transform = "none";
            node.style.transformOrigin = "top left";

            const dataUrl = await toPng(node, {
                width: 1920,
                height: 1080,
                style: {
                    width: "1920px",
                    height: "1080px",
                    transform: "none",
                    backgroundColor: "white",
                },
                pixelRatio: 1,
                cacheBust: true,
            });

            // Restore transform
            node.style.transform = originalTransform;
            node.style.transformOrigin = originalOrigin;

            saveAs(dataUrl, "snapcanvas.png");
        } catch (error) {
            console.error("Export failed:", error);
            alert("Export failed. Check console for details.");
        } finally {
            handleMenuClose();
        }
    };

    const handleSaveAsPin = async () => {
        const node = document.getElementById(targetId);
        if (!node) {
            alert("Main canvas not found!");
            return;
        }

        try {
            const originalTransform = node.style.transform;
            const originalOrigin = node.style.transformOrigin;

            node.style.transform = "none";
            node.style.transformOrigin = "top left";

            const dataUrl = await toPng(node, {
                width: 1920,
                height: 1080,
                style: {
                    width: "1920px",
                    height: "1080px",
                    transform: "none",
                    backgroundColor: "white",
                },
                pixelRatio: 1,
                cacheBust: true,
            });

            node.style.transform = originalTransform;
            node.style.transformOrigin = originalOrigin;

            // POST to /api/stored-images (server persists it)
            const res = await fetch('/api/stored-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({
                    fileName: `snapcanvas_${Date.now()}.png`,
                    mimeType: 'image/png',
                    base64Data: dataUrl
                })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to save pin');
            }

            const saved = await res.json();
            console.log(saved);
            alert('Saved pin to server successfully.');
        } catch (err) {
            console.error('Save as pin failed:', err);
            alert('Save as pin failed. Check console for details.');
        } finally {
            handleMenuClose();
        }
    };

    return (
        <>
            <Tooltip title="Export" arrow>
                <Button
                    variant="outlined"
                    endIcon={<ArrowDropDownIcon />}
                    onClick={handleMenuOpen}
                    size="small"
                >
                    <DownloadIcon sx={{ fontSize: 20 }} />
                </Button>
            </Tooltip>

            <MuiMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleExportPNG}>Export to PNG</MenuItem>
                <MenuItem onClick={handleSaveAsPin}>Share / Save as Pin</MenuItem>
            </MuiMenu>
        </>
    );
};

export default ExportButton;
