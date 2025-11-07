'use client';
import { useState } from "react";
import {
    Box,
    Button,
    Tooltip,
    Menu,
    MenuItem,
    Select,
    ToggleButton,
    ToggleButtonGroup,
    Divider,
    ListItemText,
    Popover,
    Typography,
    Slider,
    Chip,
} from "@mui/material";

import {
    FormatBold,
    FormatItalic,
    FormatUnderlined,
    FormatStrikethrough,
    FormatListBulleted,
    FormatListNumbered,
    FormatAlignLeft,
    FormatAlignCenter,
    FormatAlignRight,
    FormatAlignJustify,
    ArrowDropDown,
    TextFields,
} from "@mui/icons-material";
import { HexColorPicker } from "react-colorful";

interface FontFeatureProps {
    onFontFamilyChange?: (fontFamily: string) => void;
    onFontSizeChange?: (fontSize: number) => void;
    onFontStyleChange?: (styles: {
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        strikethrough?: boolean;
    }) => void;
    onTextAlignmentChange?: (alignment: 'left' | 'center' | 'right' | 'justify') => void;
    onListTypeChange?: (listType: 'bullet' | 'number' | 'none') => void;
    onTextColorChange?: (color: string | { type: 'solid' | 'gradient'; value: string | { start: string; end: string } }) => void;
    currentFontFamily?: string;
    currentFontSize?: number;
    currentFontStyles?: {
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        strikethrough?: boolean;
    };
    currentAlignment?: 'left' | 'center' | 'right' | 'justify';
    currentListType?: 'bullet' | 'number' | 'none';
    currentTextColor?: string | { type: 'solid' | 'gradient'; value: string | { start: string; end: string } };
}

const FontFeatButton = ({
    onFontFamilyChange,
    onFontSizeChange,
    onFontStyleChange,
    onTextAlignmentChange,
    onListTypeChange,
    onTextColorChange,
    currentFontFamily = "Arial, sans-serif",
    currentFontSize = 16,
    currentFontStyles = {},
    currentAlignment = 'left',
    currentListType = 'none',
    currentTextColor = "#000000"
}: FontFeatureProps) => {
    const [fontMenuAnchor, setFontMenuAnchor] = useState<null | HTMLElement>(null);
    const [colorPickerAnchor, setColorPickerAnchor] = useState<null | HTMLElement>(null);
    const [solidColor, setSolidColor] = useState("#000000");
    const [gradientStart, setGradientStart] = useState("#000000");
    const [gradientEnd, setGradientEnd] = useState("#FFFFFF");
    const [colorType, setColorType] = useState<'solid' | 'gradient'>('solid');

    const fontFamilies = [
        { value: "Arial, sans-serif", label: "Arial" },
        { value: "Helvetica, sans-serif", label: "Helvetica" },
        { value: "'Times New Roman', serif", label: "Times New Roman" },
        { value: "'Courier New', monospace", label: "Courier New" },
        { value: "Verdana, sans-serif", label: "Verdana" },
        { value: "Georgia, serif", label: "Georgia" },
        { value: "sans-serif", label: "Sans Serif" },
        { value: "serif", label: "Serif" },
        { value: "monospace", label: "Monospace" },
        { value: "cursive", label: "Cursive" },
        { value: "fantasy", label: "Fantasy" },
        { value: "'Roboto', sans-serif", label: "Roboto" },
        { value: "'Open Sans', sans-serif", label: "Open Sans" },
        { value: "'Noto Sans', sans-serif", label: "Noto Sans" },
    ];

    const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72];

    const handleAlignmentChange = (alignment: 'left' | 'center' | 'right' | 'justify') => {
        onTextAlignmentChange?.(alignment);
    };

    const handleListTypeChange = (listType: 'bullet' | 'number' | 'none') => {
        onListTypeChange?.(listType);
    };

    const handleSolidColorChange = (color: string) => {
        setSolidColor(color);
        onTextColorChange?.(color);
        setColorPickerAnchor(null);
    };

    const handleGradientColorApply = () => {
        onTextColorChange?.({
            type: 'gradient',
            value: {
                start: gradientStart,
                end: gradientEnd
            }
        });
        setColorPickerAnchor(null);
    };

    const handleColorTypeChange = (type: 'solid' | 'gradient') => {
        setColorType(type);
    };

    const getCurrentColorDisplay = () => {
        if (typeof currentTextColor === 'string') {
            return (
                <Box
                    sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: currentTextColor,
                        border: '1px solid #ccc',
                        borderRadius: 1
                    }}
                />
            );
        } else if (currentTextColor && typeof currentTextColor === 'object' && currentTextColor.type === 'gradient') {
            const gradientValue = currentTextColor.value as { start: string; end: string };
            return (
                <Box
                    sx={{
                        width: 20,
                        height: 20,
                        background: `linear-gradient(45deg, ${gradientValue.start}, ${gradientValue.end})`,
                        border: '1px solid #ccc',
                        borderRadius: 1
                    }}
                />
            );
        }
        return null;
    };

    return (
        <>
            <Tooltip title="Font Features" arrow>
                <Button
                    variant="outlined"
                    endIcon={<ArrowDropDown />}
                    onClick={(e) => setFontMenuAnchor(e.currentTarget)}
                    size="small"
                >
                    <TextFields sx={{ fontSize: 20 }} />
                </Button>
            </Tooltip>

            <Menu
                anchorEl={fontMenuAnchor}
                open={Boolean(fontMenuAnchor)}
                onClose={() => setFontMenuAnchor(null)}
                sx={{
                    '& .MuiPaper-root': {
                        width: 320,
                        maxHeight: 500
                    }
                }}
            >
                {/* Font Family */}
                <MenuItem>
                    <ListItemText primary="Font Family" />
                    <Select
                        size="small"
                        value={currentFontFamily}
                        onChange={(e) => onFontFamilyChange?.(e.target.value)}
                        sx={{ minWidth: 140 }}
                    >
                        {fontFamilies.map((font) => (
                            <MenuItem key={font.value} value={font.value}>
                                <span style={{ fontFamily: font.value }}>{font.label}</span>
                            </MenuItem>
                        ))}
                    </Select>
                </MenuItem>

                <Divider />

                {/* Font Size */}
                <MenuItem>
                    <ListItemText primary="Font Size" />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Select
                            size="small"
                            value={currentFontSize}
                            onChange={(e) => onFontSizeChange?.(Number(e.target.value))}
                            sx={{ minWidth: 80 }}
                        >
                            {fontSizes.map((size) => (
                                <MenuItem key={size} value={size}>
                                    {size}px
                                </MenuItem>
                            ))}
                        </Select>
                        <Slider
                            value={currentFontSize}
                            onChange={(_, value) => onFontSizeChange?.(value as number)}
                            min={8}
                            max={72}
                            step={1}
                            sx={{ width: 100 }}
                        />
                    </Box>
                </MenuItem>

                <Divider />

                {/* Font Styles */}
                <MenuItem>
                    <ListItemText primary="Style" />
                    <ToggleButtonGroup
                        size="small"
                        value={Object.keys(currentFontStyles).filter(key => currentFontStyles[key as keyof typeof currentFontStyles])}
                        onChange={(_, newStyles) => {
                            const styles = {
                                bold: newStyles.includes('bold'),
                                italic: newStyles.includes('italic'),
                                underline: newStyles.includes('underline'),
                                strikethrough: newStyles.includes('strikethrough'),
                            };
                            onFontStyleChange?.(styles);
                        }}
                    >
                        <ToggleButton value="bold">
                            <FormatBold />
                        </ToggleButton>
                        <ToggleButton value="italic">
                            <FormatItalic />
                        </ToggleButton>
                        <ToggleButton value="underline">
                            <FormatUnderlined />
                        </ToggleButton>
                        <ToggleButton value="strikethrough">
                            <FormatStrikethrough />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </MenuItem>

                <Divider />

                {/* Text Alignment */}
                <MenuItem>
                    <ListItemText primary="Alignment" />
                    <ToggleButtonGroup
                        size="small"
                        value={currentAlignment}
                        exclusive
                        onChange={(_, value) => value && handleAlignmentChange(value)}
                    >
                        <ToggleButton value="left">
                            <FormatAlignLeft />
                        </ToggleButton>
                        <ToggleButton value="center">
                            <FormatAlignCenter />
                        </ToggleButton>
                        <ToggleButton value="right">
                            <FormatAlignRight />
                        </ToggleButton>
                        <ToggleButton value="justify">
                            <FormatAlignJustify />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </MenuItem>

                <Divider />

                {/* List Types */}
                <MenuItem>
                    <ListItemText primary="List" />
                    <ToggleButtonGroup
                        size="small"
                        value={currentListType}
                        exclusive
                        onChange={(_, value) => value && handleListTypeChange(value)}
                    >
                        <ToggleButton value="none">
                            <Typography variant="body2">None</Typography>
                        </ToggleButton>
                        <ToggleButton value="bullet">
                            <FormatListBulleted />
                        </ToggleButton>
                        <ToggleButton value="number">
                            <FormatListNumbered />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </MenuItem>

                <Divider />

                {/* Text Color */}
                <MenuItem>
                    <ListItemText primary="Text Color" />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getCurrentColorDisplay()}
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => {
                                setColorPickerAnchor(e.currentTarget);
                                setColorType(typeof currentTextColor === 'string' ? 'solid' : 'gradient');
                            }}
                        >
                            Color
                        </Button>
                    </Box>
                </MenuItem>
            </Menu>

            {/* Color Picker Popover */}
            <Popover
                open={Boolean(colorPickerAnchor)}
                anchorEl={colorPickerAnchor}
                onClose={() => setColorPickerAnchor(null)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Box sx={{ p: 2, width: 300 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Text Color
                    </Typography>

                    {/* Color Type Selection */}
                    <Box sx={{ mb: 2 }}>
                        <ToggleButtonGroup
                            value={colorType}
                            exclusive
                            onChange={(_, value) => value && handleColorTypeChange(value)}
                            size="small"
                            fullWidth
                        >
                            <ToggleButton value="solid">Solid</ToggleButton>
                            <ToggleButton value="gradient">Gradient</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    {colorType === 'solid' ? (
                        <>
                            <HexColorPicker
                                color={solidColor}
                                onChange={setSolidColor}
                            />
                            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF'].map((color) => (
                                    <Chip
                                        key={color}
                                        size="small"
                                        label=""
                                        sx={{
                                            backgroundColor: color,
                                            width: 24,
                                            height: 24,
                                            border: color === '#FFFFFF' ? '1px solid #ccc' : 'none',
                                            '&:hover': { opacity: 0.8 }
                                        }}
                                        onClick={() => handleSolidColorChange(color)}
                                    />
                                ))}
                            </Box>
                            <Button 
                                variant="contained" 
                                fullWidth 
                                sx={{ mt: 2 }}
                                onClick={() => handleSolidColorChange(solidColor)}
                            >
                                Apply Solid Color
                            </Button>
                        </>
                    ) : (
                        <Box>
                            <Typography variant="body2" gutterBottom>
                                Gradient Start
                            </Typography>
                            <HexColorPicker
                                color={gradientStart}
                                onChange={setGradientStart}
                            />
                            <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                                Gradient End
                            </Typography>
                            <HexColorPicker
                                color={gradientEnd}
                                onChange={setGradientEnd}
                            />
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box
                                    sx={{
                                        width: 60,
                                        height: 30,
                                        background: `linear-gradient(45deg, ${gradientStart}, ${gradientEnd})`,
                                        border: '1px solid #ccc',
                                        borderRadius: 1
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handleGradientColorApply}
                                >
                                    Apply Gradient
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Popover>
        </>
    );
};

export default FontFeatButton;