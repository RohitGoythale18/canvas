'use client';
import Image from "next/image"
import { Box, Divider, List, Typography } from "@mui/material";
import { MenuBarProps } from "@/types";

import BoardButton from "./buttons/BoardButton";
import NewCanvasButton from "./buttons/NewCanvasButton";
import SplitButton from "./buttons/SplitButton";
import ExportButton from "./buttons/ExportButton";
import UndoButton from "./buttons/UndoButton";
import RedoButton from "./buttons/RedoButton";
import LayerButton from "./buttons/LayerButton";
import PencilButton from "./buttons/PencilButton";
import FillButton from "./buttons/FillButton";
import EraserButton from "./buttons/EraserButton";
import ShapeButton from "./buttons/ShapeButton";
import TextButton from "./buttons/TextButton";
import UploadImageButton from "./buttons/UploadImageButton";
import ClearImageButton from "./buttons/ClearImageButton";
import ColorButton from "./buttons/ColorButton";
import BorderButton from "./buttons/BorderButton";
import FontFeatButton from "./buttons/FontFeatButton";
import LogoutButton from "./buttons/LogoutButton";

const MenuBar = ({ onSaveCanvas, onLoadCanvas, canvasData, onNewCanvas, onSplitChange, onUndo, onRedo, onPencilToggle, onFillToggle, onColorChange, fillColor, onEraserToggle, onEraserSizeChange, eraserSize, pencilActive, fillActive, eraserActive, onShapeSelect, onTextToggle, textActive, onImageUpload, clearImage, onCanvasBackgroundChange, selectedPanel, onBorderToggle, onBorderChange, borderActive, currentFontFamily, currentFontSize, currentFontStyles, currentTextAlignment, currentListType, currentTextColor, onFontFamilyChange, onFontSizeChange, onFontStyleChange, onTextAlignmentChange, onListTypeChange, onTextColorChange, onBringForward, onBringToFront, onSendBackward, onSendToBack, hasSelectedShape }: MenuBarProps) => {
    return (
        <Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', py: 1, px: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Image src="/canvasIcon.png" width={35} height={35} alt="SnapCanvas Logo" />
                    <Typography variant="h3" sx={{ fontSize: '1.9rem', fontWeight: 600, color: 'white' }}>
                        SnapCanvas
                    </Typography>
                </Box>
                <LogoutButton />
            </Box>

            <Divider sx={{ width: '100%', borderColor: 'primary.main' }} />

            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, px: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h2" sx={{ fontSize: '1rem' }}>Home</Typography>
                    <List sx={{ p: 1, display: "flex", gap: 1 }}>
                        <BoardButton canvasData={canvasData} onLoadCanvas={onLoadCanvas} getCurrentCanvasImage={onSaveCanvas} />
                        <NewCanvasButton onNewCanvas={onNewCanvas} />
                        <SplitButton onSplitSelect={(mode) => onSplitChange?.(mode)} />
                        <ExportButton targetId="canvas-container" />
                    </List>
                </Box>

                <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: 'primary.main' }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h2" sx={{ fontSize: '1rem' }}>Edit</Typography>
                    <Box sx={{ display: 'flex' }}>
                        <List sx={{ display: "flex", gap: 1, px: 1 }}>
                            <UndoButton onUndo={onUndo} />
                            <RedoButton onRedo={onRedo} />
                            <LayerButton onBringToFront={onBringToFront} onBringForward={onBringForward} onSendBackward={onSendBackward} onSendToBack={onSendToBack} disabled={!hasSelectedShape} />
                        </List>

                        <Divider orientation="vertical" sx={{ borderColor: 'primary.main' }} />

                        <List sx={{ p: 1, display: "flex", gap: 1 }}>
                            <PencilButton active={pencilActive} onToggle={onPencilToggle} />

                            <FillButton active={fillActive} onFillToggle={onFillToggle} onColorChange={onColorChange} currentColor={fillColor} />

                            <EraserButton active={eraserActive} onEraserToggle={onEraserToggle} onSizeChange={onEraserSizeChange} eraserSize={eraserSize} />
                        </List>
                    </Box>
                </Box>

                <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: 'primary.main' }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h2" sx={{ fontSize: '1rem' }}>Insert</Typography>
                    <List sx={{ p: 1, display: "flex", gap: 1 }}>
                        <ShapeButton onShapeSelect={onShapeSelect} />
                        <TextButton active={textActive} onToggle={onTextToggle} />
                        <UploadImageButton onImageUpload={onImageUpload} />
                        <ClearImageButton onClearImage={clearImage} />
                    </List>
                </Box>

                <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: 'primary.main' }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h2" sx={{ fontSize: '1rem' }}>Design</Typography>
                    <List sx={{ p: 1, display: "flex", gap: 1 }}>
                        <ColorButton onColorChange={onCanvasBackgroundChange} panelId={selectedPanel} />
                        <BorderButton active={borderActive} onBorderToggle={onBorderToggle} onBorderChange={onBorderChange} />
                        <FontFeatButton
                            onFontFamilyChange={onFontFamilyChange}
                            onFontSizeChange={onFontSizeChange}
                            onFontStyleChange={onFontStyleChange}
                            onTextAlignmentChange={onTextAlignmentChange}
                            onListTypeChange={onListTypeChange}
                            onTextColorChange={onTextColorChange}
                            currentFontFamily={currentFontFamily}
                            currentFontSize={currentFontSize}
                            currentFontStyles={currentFontStyles}
                            currentAlignment={currentTextAlignment}
                            currentListType={currentListType}
                            currentTextColor={currentTextColor}
                        />
                    </List>
                </Box>
            </Box>

            <Divider sx={{ width: '100%', borderColor: 'primary.main' }} />
        </Box>
    )
}

export default MenuBar;