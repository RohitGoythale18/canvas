'use client';
import { useState } from "react";
import { Tooltip, Button, Menu, MenuItem, Divider, TextField, Box } from "@mui/material";
import PaletteIcon from "@mui/icons-material/Palette";

interface ColorButtonProps {
    onColorChange?: (color: { type: 'solid' | 'gradient'; value: string | { start: string; end: string } }, panelId?: string) => void;
    panelId?: string;
}

const ColorButton = ({ onColorChange, panelId }: ColorButtonProps) => {
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [colorType, setColorType] = useState<'solid' | 'gradient'>('solid');
    const [solidColor, setSolidColor] = useState('#ffffff');
    const [gradientStart, setGradientStart] = useState('#ffffff');
    const [gradientEnd, setGradientEnd] = useState('#000000');

    const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMenuAnchor(event.currentTarget);
    };

    const closeMenu = () => {
        setMenuAnchor(null);
    };

    const handleColorTypeChange = (type: 'solid' | 'gradient') => {
        setColorType(type);
        if (type === 'solid') {
            onColorChange?.({ type: 'solid', value: solidColor }, panelId);
        } else {
            onColorChange?.({ type: 'gradient', value: { start: gradientStart, end: gradientEnd } }, panelId);
        }
    };

    const handleSolidColorChange = (color: string) => {
        setSolidColor(color);
        onColorChange?.({ type: 'solid', value: color }, panelId);
    };

    const handleGradientStartChange = (color: string) => {
        setGradientStart(color);
        onColorChange?.({ type: 'gradient', value: { start: color, end: gradientEnd } }, panelId);
    };

    const handleGradientEndChange = (color: string) => {
        setGradientEnd(color);
        onColorChange?.({ type: 'gradient', value: { start: gradientStart, end: color } }, panelId);
    };

    return (
        <>
            <Tooltip title="Canvas Background Color" arrow>
                <Button
                    variant="outlined"
                    onClick={openMenu}
                    size="small"
                >
                    <PaletteIcon sx={{ fontSize: 20 }} />
                </Button>
            </Tooltip>

            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
                <MenuItem>
                    <Button
                        variant={colorType === 'solid' ? 'contained' : 'outlined'}
                        onClick={() => handleColorTypeChange('solid')}
                        size="small"
                        sx={{ mr: 1 }}
                    >
                        Solid
                    </Button>
                    <Button
                        variant={colorType === 'gradient' ? 'contained' : 'outlined'}
                        onClick={() => handleColorTypeChange('gradient')}
                        size="small"
                    >
                        Gradient
                    </Button>
                </MenuItem>
                <Divider />

                {colorType === 'solid' ? (
                    <MenuItem>
                        <Box display="flex" alignItems="center">
                            <input
                                type="color"
                                value={solidColor}
                                onChange={(e) => handleSolidColorChange(e.target.value)}
                                style={{ width: 40, height: 40, border: "none", cursor: "pointer", marginRight: 8 }}
                            />
                            <TextField
                                label="Solid Color"
                                value={solidColor}
                                onChange={(e) => handleSolidColorChange(e.target.value)}
                                size="small"
                                sx={{ minWidth: 120 }}
                            />
                        </Box>
                    </MenuItem>
                ) : (
                    <Box>
                        <MenuItem>
                            <Box display="flex" alignItems="center">
                                <input
                                    type="color"
                                    value={gradientStart}
                                    onChange={(e) => handleGradientStartChange(e.target.value)}
                                    style={{ width: 40, height: 40, border: "none", cursor: "pointer", marginRight: 8 }}
                                />
                                <TextField
                                    label="Start Color"
                                    value={gradientStart}
                                    onChange={(e) => handleGradientStartChange(e.target.value)}
                                    size="small"
                                    sx={{ minWidth: 120 }}
                                />
                            </Box>
                        </MenuItem>
                        <MenuItem>
                            <Box display="flex" alignItems="center">
                                <input
                                    type="color"
                                    value={gradientEnd}
                                    onChange={(e) => handleGradientEndChange(e.target.value)}
                                    style={{ width: 40, height: 40, border: "none", cursor: "pointer", marginRight: 8 }}
                                />
                                <TextField
                                    label="End Color"
                                    value={gradientEnd}
                                    onChange={(e) => handleGradientEndChange(e.target.value)}
                                    size="small"
                                    sx={{ minWidth: 120 }}
                                />
                            </Box>
                        </MenuItem>
                    </Box>
                )}
            </Menu>
        </>
    );
};

export default ColorButton;
