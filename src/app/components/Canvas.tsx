'use client';
import { useState, useRef } from "react";
import { Box } from "@mui/material";
import { Shape, DrawingPath, FontFeatures } from "../../types";

import { useCanvasResize } from "../../hooks/useCanvasResize";
import { useDrawingTools } from "../../hooks/useDrawingTools";
import { useFillTool } from "../../hooks/useFillTool";
import { useTextTools } from "../../hooks/useTextTools";
import { useShapeInteraction } from "../../hooks/useShapeInteraction";
import { useShapeProperties } from "../../hooks/useShapeProperties";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { useCanvasCleanup } from "../../hooks/useCanvasCleanup";
import { useShapeRenderer } from "../../hooks/useShapeRenderer";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

interface CanvasProps {
    splitMode?: string;
    pencilActive?: boolean;
    fillActive?: boolean;
    fillColor?: string;
    eraserActive?: boolean;
    eraserSize?: number;
    selectedShape?: string | null;
    onShapeSelect: (shape: string) => void;
    textActive?: boolean;
    onTextToggle?: (enabled: boolean) => void; // <-- added
    uploadedImageUrl?: string | null;
    loadedImage?: HTMLImageElement | null;
    currentImageId?: string | null;
    onImageUsed?: () => void;
    onClearImage?: () => void;
    backgroundColor?: Record<string, string | { start: string; end: string }>;
    onPanelSelect?: (panelId: string) => void;
    borderActive?: boolean;
    borderType?: 'solid' | 'dashed' | 'dotted';
    borderSize?: number;
    borderColor?: string;
    currentFontFeatures?: FontFeatures;
    shapes: Shape[];
    onShapesChange: React.Dispatch<React.SetStateAction<Shape[]>>;
    drawings: Array<{ panelId: string; paths: DrawingPath[] }>;
    onDrawingsChange: React.Dispatch<React.SetStateAction<Array<{ panelId: string; paths: DrawingPath[] }>>>;
    filledImages: Array<{ panelId: string; imageData: ImageData }>;
    onFilledImagesChange: React.Dispatch<React.SetStateAction<Array<{ panelId: string; imageData: ImageData }>>>;
    onSaveState: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
}

const Canvas = ({
    splitMode = "none",
    pencilActive = false,
    fillActive = false,
    fillColor = "#ff0000",
    eraserActive = false,
    eraserSize = 10,
    selectedShape = null,
    onShapeSelect,
    textActive = false,
    onTextToggle, // <-- accept prop
    uploadedImageUrl,
    loadedImage,
    currentImageId,
    onImageUsed,
    // onClearImage,
    backgroundColor = { default: "#ffffff" },
    onPanelSelect,
    borderActive = false,
    borderType = 'solid',
    borderSize = 2,
    borderColor = '#000000',
    currentFontFeatures,
    shapes,
    onShapesChange,
    drawings,
    onDrawingsChange,
    filledImages,
    onFilledImagesChange,
    onSaveState,
    onUndo,
    onRedo,
}: CanvasProps) => {

    const [dragging, setDragging] = useState(false);
    const [resizing, setResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    const [textInput, setTextInput] = useState<string>("");
    const [editingShapeId, setEditingShapeId] = useState<string | null>(null);

    const wrapperRef = useRef<HTMLDivElement>(null);

    const { zoomLevel } = useCanvasResize(wrapperRef);

    useDrawingTools({
        pencilActive,
        eraserActive,
        eraserSize,
        splitMode,
        setDrawings: onDrawingsChange,
        onSaveState,
        shapes,
        onShapesChange
    });

    useFillTool({
        splitMode,
        fillActive,
        fillColor,
        setFilledImages: onFilledImagesChange,
        shapes,
        onShapesChange,
        onSaveState
    });

    useTextTools({
        textActive,
        shapes,
        textInput,
        editingShapeId,
        currentFontFeatures,
        onShapesChange,
        setTextInput,
        setEditingShapeId,
        onTextToggle,
    });

    useShapeInteraction({
        selectedShape,
        splitMode,
        onShapeSelect,
        shapes,
        pencilActive,
        eraserActive,
        fillActive,
        textActive,
        uploadedImageUrl,
        loadedImage,
        currentImageId,
        onImageUsed,
        borderActive,
        borderColor,
        borderSize,
        borderType,
        zoomLevel,
        onShapesChange,
        setDragging,
        setResizing,
        setDragOffset,
        setResizeHandle,
        dragging,
        resizing,
        resizeHandle,
        dragOffset,
        onSaveState
    });

    useShapeProperties({
        borderActive,
        borderType,
        borderSize,
        borderColor,
        shapes,
        onShapesChange,
        currentFontFeatures
    });

    useKeyboardShortcuts({
        shapes,
        onShapesChange,
        onSaveState,
        onUndo: onUndo,
        onRedo: onRedo,
    });

    useCanvasCleanup({
        splitMode,
        setDrawings: onDrawingsChange,
        setFilledImages: onFilledImagesChange
    });

    useShapeRenderer({
        shapes,
        drawings,
        filledImages,
        splitMode,
        textInput,
        editingShapeId,
        loadedImage,
        backgroundColor,
    });

    const getBackgroundStyle = (panelId: string) => {
        const panelColor = backgroundColor[panelId] || backgroundColor.default || "#ffffff";
        if (typeof panelColor === 'string') {
            return { backgroundColor: panelColor };
        } else {
            return {
                background: `linear-gradient(to bottom, ${panelColor.start}, ${panelColor.end})`
            };
        }
    };

    const renderPanelCanvas = (widthMult = 1, heightMult = 1, panelId = "default") => (
        <div
            style={{ position: 'relative', width: '100%', height: '100%', ...getBackgroundStyle(panelId) }}
            onClick={() => onPanelSelect?.(panelId)}
        >
            <canvas
                className="drawing-panel border border-gray-400"
                width={CANVAS_WIDTH * widthMult}
                height={CANVAS_HEIGHT * heightMult}
                style={{ width: "100%", height: "100%" }}
                data-panel-id={panelId}
                tabIndex={0}
            />

        </div>
    );

    const renderPanels = () => {
        switch (splitMode) {
            case "2-way":
                return (
                    <Box id="canvas-container" sx={{
                        width: `${CANVAS_WIDTH}px`,
                        height: `${CANVAS_HEIGHT}px`,
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: "center center",
                        display: 'flex'
                    }}>
                        {renderPanelCanvas(0.5, 1, "panel-1")}
                        {renderPanelCanvas(0.5, 1, "panel-2")}
                    </Box>
                );

            case "3-way-left":
                return (
                    <Box id="canvas-container" sx={{
                        width: `${CANVAS_WIDTH}px`,
                        height: `${CANVAS_HEIGHT}px`,
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: "center center",
                        display: 'flex'
                    }}>
                        <Box sx={{ flex: 1 }}>{renderPanelCanvas(1, 1, "panel-1")}</Box>
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ flex: 1 }}>{renderPanelCanvas(1, 1, "panel-2")}</Box>
                            <Box sx={{ flex: 1 }}>{renderPanelCanvas(1, 1, "panel-3")}</Box>
                        </Box>
                    </Box>
                );

            case "3-way-right":
                return (
                    <Box id="canvas-container" sx={{
                        width: `${CANVAS_WIDTH}px`,
                        height: `${CANVAS_HEIGHT}px`,
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: "center center",
                        display: 'flex'
                    }}>
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ flex: 1 }}>{renderPanelCanvas(1, 1, "panel-1")}</Box>
                            <Box sx={{ flex: 1 }}>{renderPanelCanvas(1, 1, "panel-2")}</Box>
                        </Box>
                        <Box sx={{ flex: 1 }}>{renderPanelCanvas(1, 1, "panel-3")}</Box>
                    </Box>
                );

            case "4-way":
                return (
                    <Box id="canvas-container" sx={{
                        width: `${CANVAS_WIDTH}px`,
                        height: `${CANVAS_HEIGHT}px`,
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: "center center",
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gridTemplateRows: 'repeat(2, 1fr)'
                    }}>
                        {renderPanelCanvas(.5, .5, "panel-1")}
                        {renderPanelCanvas(.5, .5, "panel-2")}
                        {renderPanelCanvas(.5, .5, "panel-3")}
                        {renderPanelCanvas(.5, .5, "panel-4")}
                    </Box>
                );

            default:
                return (
                    <Box id="canvas-container" sx={{
                        width: `${CANVAS_WIDTH}px`,
                        height: `${CANVAS_HEIGHT}px`,
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: "center center"
                    }}>
                        {renderPanelCanvas(1, 1, "default")}
                    </Box>
                );
        }
    };

    return (
        <Box
            ref={wrapperRef}
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}
        >
            <Box>{renderPanels()}</Box>
        </Box>
    );
};

export default Canvas;
