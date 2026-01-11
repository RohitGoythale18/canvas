'use client';
import { useState } from "react";
import { BorderButtonProps } from "@/types";

import { Tooltip, Button, Menu, MenuItem, Divider, Slider, TextField, Box } from "@mui/material";
import BorderAllIcon from "@mui/icons-material/BorderAll";

const BorderButton = ({ active = false, onBorderChange }: BorderButtonProps) => {
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [borderType, setBorderType] = useState<'solid' | 'dashed' | 'dotted'>('solid');
    const [borderSize, setBorderSize] = useState(2);
    const [borderColor, setBorderColor] = useState('#000000');

    const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMenuAnchor(event.currentTarget);
    };

    const closeMenu = () => {
        setMenuAnchor(null);
    };

    const handleBorderTypeChange = (type: 'solid' | 'dashed' | 'dotted') => {
        setBorderType(type);
        onBorderChange?.({ type, size: borderSize, color: borderColor });
    };

    const handleBorderSizeChange = (_: Event | React.SyntheticEvent, value: number | number[]) => {
        const size = Array.isArray(value) ? value[0] : value;
        setBorderSize(size);
        onBorderChange?.({ type: borderType, size, color: borderColor });
    };

    const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const size = parseInt(e.target.value) || 1;
        setBorderSize(size);
        onBorderChange?.({ type: borderType, size, color: borderColor });
    };

    const handleBorderColorChange = (color: string) => {
        setBorderColor(color);
        onBorderChange?.({ type: borderType, size: borderSize, color });
    };

    return (
        <>
            <Tooltip title="Border Options" arrow>
                <Button
                    variant={active ? "contained" : "outlined"}
                    onClick={handleButtonClick}   // new update
                    size="small"
                >
                    <BorderAllIcon sx={{ fontSize: 20 }} />
                </Button>
            </Tooltip>

            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={closeMenu}
            >
                <MenuItem>
                    <Button
                        variant={borderType === 'solid' ? 'contained' : 'outlined'}
                        onClick={() => handleBorderTypeChange('solid')}
                        size="small"
                        sx={{ mr: 1 }}
                    >
                        Solid
                    </Button>
                    <Button
                        variant={borderType === 'dashed' ? 'contained' : 'outlined'}
                        onClick={() => handleBorderTypeChange('dashed')}
                        size="small"
                        sx={{ mr: 1 }}
                    >
                        Dashed
                    </Button>
                    <Button
                        variant={borderType === 'dotted' ? 'contained' : 'outlined'}
                        onClick={() => handleBorderTypeChange('dotted')}
                        size="small"
                    >
                        Dotted
                    </Button>
                </MenuItem>

                <Divider />

                <MenuItem>
                    <Box display="flex" alignItems="center" width="100%">
                        <Box style={{ marginRight: 8 }}>Size:</Box>
                        <Slider
                            value={borderSize}
                            onChange={handleBorderSizeChange}
                            min={1}
                            max={20}
                            step={1}
                            sx={{ flexGrow: 1, mr: 2 }}
                        />
                        <TextField
                            type="number"
                            value={borderSize}
                            onChange={handleTextFieldChange}
                            size="small"
                            sx={{ width: 60 }}
                        />
                    </Box>
                </MenuItem>

                <Divider />

                <MenuItem>
                    <Box display="flex" alignItems="center">
                        <input
                            type="color"
                            value={borderColor}
                            onChange={(e) => handleBorderColorChange(e.target.value)}
                            style={{
                                width: 40,
                                height: 40,
                                border: "none",
                                cursor: "pointer",
                                marginRight: 8
                            }}
                        />
                        <TextField
                            label="Border Color"
                            value={borderColor}
                            onChange={(e) => handleBorderColorChange(e.target.value)}
                            size="small"
                            sx={{ minWidth: 120 }}
                        />
                    </Box>
                </MenuItem>
            </Menu>
        </>
    );
};

export default BorderButton;
