'use client';
import { useState } from "react";
import { FillButtonProps } from "@/types";
import { Tooltip, Button, Menu, MenuItem, Divider, Box } from "@mui/material";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";

const FillButton = ({
    active = false,
    onFillToggle,
    onColorChange,
    currentColor
}: FillButtonProps) => {
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [fillColor, setFillColor] = useState(currentColor || "#ff0000");

    /** LEFT CLICK → toggle fill + open menu */
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onFillToggle?.(!active); // ✅ activate fill tool
        setMenuAnchor(event.currentTarget); // ✅ open color picker
    };

    const closeMenu = () => setMenuAnchor(null);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;
        setFillColor(color);
        onColorChange?.(color);
    };

    return (
        <>
            <Tooltip title="Fill shape color" arrow>
                <Button
                    variant={active ? "contained" : "outlined"}
                    onClick={handleClick}
                    size="small"
                >
                    <FormatColorFillIcon
                        sx={{ fontSize: 20, color: active ? "white" : fillColor }}
                    />
                </Button>
            </Tooltip>

            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
                <MenuItem>
                    <input
                        type="color"
                        value={fillColor}
                        onChange={handleColorChange}
                        style={{
                            width: 40,
                            height: 40,
                            border: "none",
                            cursor: "pointer"
                        }}
                    />
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    <Box>{fillColor}</Box>
                </MenuItem>
            </Menu>
        </>
    );
};

export default FillButton;
