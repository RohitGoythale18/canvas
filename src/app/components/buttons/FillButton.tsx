'use client';
import { useState } from "react";
import { Tooltip, Button, Menu, MenuItem, Divider } from "@mui/material";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";

interface FillButtonProps {
    active?: boolean;
    onFillToggle?: (enabled: boolean) => void;
    onColorChange?: (color: string) => void;
    currentColor?: string;
}

const FillButton = ({ active = false, onFillToggle, onColorChange, currentColor }: FillButtonProps) => {
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [fillColor, setFillColor] = useState(currentColor || "#ff0000");



    const handleClick = () => {
        onFillToggle?.(!active);
        setMenuAnchor(null);
    };

    const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setMenuAnchor(event.currentTarget);
    };

    const closeMenu = () => {
        setMenuAnchor(null);
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFillColor(e.target.value);
        onColorChange?.(e.target.value);
    };



    return (
        <>
            <Tooltip title="Fill (Click to toggle, Right-click for color picker)" arrow>
                <Button
                    variant={active ? "contained" : "outlined"}
                    onClick={handleClick}
                    onContextMenu={openMenu}
                    size="small"
                >
                    <FormatColorFillIcon sx={{ fontSize: 20, color: active ? "white" : fillColor }} />
                </Button>
            </Tooltip>

            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
                <MenuItem>
                    <input
                        type="color"
                        value={fillColor}
                        onChange={handleColorChange}
                        style={{ width: 40, height: 40, border: "none", cursor: "pointer" }}
                    />
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    <span>{fillColor}</span>
                </MenuItem>
            </Menu>
        </>
    );
};

export default FillButton;
