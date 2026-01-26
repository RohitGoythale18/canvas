// src/app/components/Canvas.tsx
'use client';
import { useState, useRef } from "react";

import { useCanvasResize } from "@/hooks/useCanvasResize";
import { useDrawingTools } from "@/hooks/useDrawingTools";
import { useFillTool } from "@/hooks/useFillTool";
import { useTextTools } from "@/hooks/useTextTools";
import { useShapeInteraction } from "@/hooks/useShapeInteraction";
import { useShapeProperties } from "@/hooks/useShapeProperties";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useCanvasCleanup } from "@/hooks/useCanvasCleanup";
import { useShapeRenderer } from "@/hooks/useShapeRenderer";

import { Box } from "@mui/material";
import { CanvasProps, CanvasRefs } from "@/types";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

const Canvas = ({
    splitMode = "none",
    executeCommand,
    pencilActive = false,
    fillActive = false,
    fillColor = "#ff0000",
    eraserActive = false,
    eraserSize = 10,
    selectedShape = null,
    onShapeSelect,
    textActive = false,
    onTextToggle,
    uploadedImageUrl,
    loadedImage,
    currentImageId,
    onImageUsed,
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
    permission = 'READ',
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
    const canvasRefs = useRef<CanvasRefs>({});

    const { zoomLevel } = useCanvasResize(wrapperRef);

    useDrawingTools({
        executeCommand,
        pencilActive,
        eraserActive,
        eraserSize,
        splitMode,
        setDrawings: onDrawingsChange,
        shapes,
        onShapesChange,
        permission,
        canvasRefs
    });

    useFillTool({
        executeCommand,
        splitMode,
        fillActive,
        fillColor,
        setFilledImages: onFilledImagesChange,
        shapes,
        onShapesChange,
        permission,
        canvasRefs
    });

    useTextTools({
        executeCommand,
        textActive,
        shapes,
        textInput,
        editingShapeId,
        currentFontFeatures,
        onShapesChange,
        setTextInput,
        setEditingShapeId,
        onTextToggle,
        permission,
        canvasRefs
    });

    useShapeInteraction({
        selectedShape,
        splitMode,
        executeCommand,
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
        permission,
        canvasRefs,
        onPanelSelect
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
        canvasRefs
    });

    useKeyboardShortcuts({
        shapes,
        onShapesChange,
        permission,
        onUndo,
        onRedo
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
                ref={(el) => { canvasRefs.current[panelId] = el; }}
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

    const isReadOnly = permission === 'READ';

    return (
        <Box
            ref={wrapperRef}
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                pointerEvents: isReadOnly ? 'none' : 'auto'
            }}
        >
            <Box>{renderPanels()}</Box>
        </Box>
    );
};

export default Canvas;
