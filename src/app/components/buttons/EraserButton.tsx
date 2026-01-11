'use client';
import { useState } from "react";
import { EraserButtonProps } from "@/types";

import { Tooltip, Button, Menu, MenuItem, Divider, Slider, Typography, Box } from "@mui/material";
import { IconEraser } from "@tabler/icons-react";

const EraserButton = ({ active = false, onEraserToggle, onSizeChange, eraserSize = 10 }: EraserButtonProps) => {
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const newState = !active;
        onEraserToggle?.(newState);
        if (newState) {
            setMenuAnchor(event.currentTarget);
        } else {
            setMenuAnchor(null);
        }
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
                    onClick={handleClick}
                    size="small"
                >
                    <IconEraser stroke={2} color={active ? "white" : "white"} className="size-5" />
                </Button>
            </Tooltip>

            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
                <MenuItem disabled>
                    <Typography variant="body2">Eraser Size: {eraserSize}px</Typography>
                </MenuItem>
                <Divider />
                <Box sx={{ px: 2, py: 1, width: 200 }}>
                    <Slider
                        value={eraserSize}
                        onChange={(_, value) => handleSizeChange(value as number)}
                        min={5}
                        max={40}
                        step={1}
                        valueLabelDisplay="auto"
                        marks={[
                            { value: 5, label: '5px' },
                            { value: 20, label: '20px' },
                            { value: 40, label: '40px' }
                        ]}
                    />
                </Box>
            </Menu>
        </>
    );
};

export default EraserButton;
