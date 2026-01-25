'use client';
import { useState } from "react";
import { ExportButtonProps } from "@/types";
import { useExportToPng } from "@/hooks/useExportToPng";
import { useExportToJpg } from "@/hooks/useExportToJpg";
import { useExportToPdf } from "@/hooks/useExportToPdf";

import { Button, Menu as MuiMenu, MenuItem, Tooltip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";


const ExportButton = ({ targetId = "canvas-container" }: ExportButtonProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { exportToPng } = useExportToPng({ targetId });
    const { exportToJpg } = useExportToJpg({ targetId });
    const { exportToPdf } = useExportToPdf({ targetId });

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleExportPNG = async () => {
        await exportToPng();
        handleMenuClose();
    };

    const handleSaveAsJPG = async () => {
        await exportToJpg();
        handleMenuClose();
    };

    const handleSaveAsPDF = async () => {
        await exportToPdf();
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
                <MenuItem onClick={handleExportPNG}>PNG</MenuItem>
                <MenuItem onClick={handleSaveAsJPG}>JPG</MenuItem>
                <MenuItem onClick={handleSaveAsPDF}>PDF</MenuItem>
            </MuiMenu>
        </>
    );
};

export default ExportButton;
