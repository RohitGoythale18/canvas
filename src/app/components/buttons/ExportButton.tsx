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
        alert("Share functionality coming soon!");
        handleMenuClose();
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
                <MenuItem onClick={handleSaveAsPin}>Share</MenuItem>
            </MuiMenu>
        </>
    );
};

export default ExportButton;
