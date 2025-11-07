'use client';
import { useState } from "react";
import { Tooltip, Button, Menu, MenuItem, Divider } from "@mui/material";
import { IconEraser } from "@tabler/icons-react";

interface EraserButtonProps {
    active?: boolean;
    onEraserToggle?: (enabled: boolean) => void;
    onSizeChange?: (size: number) => void;
}

const EraserButton = ({ active = false, onEraserToggle, onSizeChange }: EraserButtonProps) => {
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

    const toggleEraser = () => {
        onEraserToggle?.(!active);
    };

    const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMenuAnchor(event.currentTarget);
    };

    const closeMenu = () => {
        setMenuAnchor(null);
    };

    const handleSizeChange = (size: number) => {
        onSizeChange?.(size);
    };

    return (
        <>
            <Tooltip title="Eraser" arrow>
                <Button
                    variant={active ? "contained" : "outlined"}
                    onClick={toggleEraser}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        openMenu(e as never);
                    }}
                    size="small"
                >
                    <IconEraser stroke={2} color={active ? "white" : "white"} />
                </Button>
            </Tooltip>

            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
                <MenuItem disabled>Eraser Size</MenuItem>
                <Divider />
                {[5, 10, 15, 20, 30, 40].map((size) => (
                    <MenuItem
                        key={size}
                        onClick={() => {
                            handleSizeChange(size);
                            closeMenu();
                        }}
                    >
                        {size}px
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default EraserButton;
