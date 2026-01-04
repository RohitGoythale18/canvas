import { Shape, UseShapeInteractionProps } from '@/types';
import { useEffect } from 'react';

const MIN_SHAPE_WIDTH = 20;
const MIN_SHAPE_HEIGHT = 20;

export const useShapeInteraction = ({
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
    onSaveState,
    permission
}: UseShapeInteractionProps) => {
    useEffect(() => {
        const canvases = document.querySelectorAll<HTMLCanvasElement>(".drawing-panel");
        const cleanupFns: (() => void)[] = [];
        const canEdit = permission === 'OWNER' || permission === 'WRITE';

        canvases.forEach((canvas) => {
            const handleMouseDown = (e: MouseEvent) => {
                if (pencilActive || eraserActive || fillActive || textActive) return;

                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) * (canvas.width / rect.width);
                const y = (e.clientY - rect.top) * (canvas.height / rect.height);

                if (selectedShape) {
                    if (!canEdit) return;
                    // Create new blank shape
                    const panelId = canvas.getAttribute("data-panel-id") || "default";

                    const newShape: Shape = {
                        id: `${Date.now()}-${Math.random()}`,
                        type: selectedShape,
                        x: x - 40,
                        y: y - 40,
                        width: Math.max(80, MIN_SHAPE_WIDTH),
                        height: Math.max(80, MIN_SHAPE_HEIGHT),
                        selected: false,
                        panelId: panelId,
                        fillColor: "#60a5fa",

                        // NEW WORKFLOW: remove auto-image insertion
                        imageUrl: undefined,
                        imageId: undefined,
                        imageElement: undefined,

                        borderType: undefined,
                        borderSize: undefined,
                        borderColor: undefined,
                    };
                    onShapesChange(prev => [...prev, newShape]);
                    onShapeSelect(null as never);
                    return;
                }

                // Resize handles
                let foundHandle = false;
                shapes.forEach((shape) => {
                    if (shape.selected) {
                        const handleSize = 8;
                        const handles = [
                            { name: 'top-left', x: shape.x, y: shape.y },
                            { name: 'top-right', x: shape.x + shape.width, y: shape.y },
                            { name: 'bottom-left', x: shape.x, y: shape.y + shape.height },
                            { name: 'bottom-right', x: shape.x + shape.width, y: shape.y + shape.height },
                        ];

                        handles.forEach((handle) => {
                            if (!canEdit) return;
                            if (x >= handle.x - handleSize / 2 && x <= handle.x + handleSize / 2 &&
                                y >= handle.y - handleSize / 2 && y <= handle.y + handleSize / 2) {
                                setResizing(true);
                                setResizeHandle(handle.name);
                                setDragOffset({ x: x - handle.x, y: y - handle.y });
                                foundHandle = true;
                            }
                        });
                    }
                });

                if (foundHandle) return;

                // Selecting shape
                let selectedShapeId: string | null = null;
                shapes.forEach((shape) => {
                    if (x >= shape.x && x <= shape.x + shape.width &&
                        y >= shape.y && y <= shape.y + shape.height) {
                        selectedShapeId = shape.id;
                    }
                });

                onShapesChange(prev => prev.map(shape => ({
                    ...shape,
                    selected: shape.id === selectedShapeId,
                })));

                if (selectedShapeId) {
                    const selected = shapes.find(s => s.id === selectedShapeId);
                    if (selected) {
                        setDragging(true);
                        setDragOffset({ x: x - selected.x, y: y - selected.y });
                    }
                } else {
                    // Deselect all
                    onShapesChange(prev => prev.map(shape => ({
                        ...shape,
                        selected: false,
                    })));
                }
            };

            const handleMouseMove = (e: MouseEvent) => {
                if (pencilActive || eraserActive || fillActive || textActive) return;

                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) * (canvas.width / rect.width);
                const y = (e.clientY - rect.top) * (canvas.height / rect.height);

                if (dragging) {
                    if (!canEdit) return;
                    onShapesChange(prev => prev.map(shape => {
                        if (shape.selected) {
                            return {
                                ...shape,
                                x: x - dragOffset.x,
                                y: y - dragOffset.y,
                            };
                        }
                        return shape;
                    }));
                } else if (resizing && resizeHandle) {
                    if (!canEdit) return;

                    onShapesChange(prev => prev.map(shape => {
                        if (shape.selected) {
                            let newX = shape.x;
                            let newY = shape.y;
                            let newWidth = shape.width;
                            let newHeight = shape.height;

                            switch (resizeHandle) {
                                case 'top-left':
                                    newX = x - dragOffset.x;
                                    newY = y - dragOffset.y;
                                    newWidth = shape.x + shape.width - newX;
                                    newHeight = shape.y + shape.height - newY;
                                    break;
                                case 'top-right':
                                    newY = y - dragOffset.y;
                                    newWidth = x - dragOffset.x - shape.x;
                                    newHeight = shape.y + shape.height - newY;
                                    break;
                                case 'bottom-left':
                                    newX = x - dragOffset.x;
                                    newWidth = shape.x + shape.width - newX;
                                    newHeight = y - dragOffset.y - shape.y;
                                    break;
                                case 'bottom-right':
                                    newWidth = x - dragOffset.x - shape.x;
                                    newHeight = y - dragOffset.y - shape.y;
                                    break;
                            }

                            newWidth = Math.max(MIN_SHAPE_WIDTH, newWidth);
                            newHeight = Math.max(MIN_SHAPE_HEIGHT, newHeight);

                            return {
                                ...shape,
                                x: newX,
                                y: newY,
                                width: newWidth,
                                height: newHeight,
                            };
                        }
                        return shape;
                    }));
                }
            };

            const handleMouseUp = () => {
                setDragging(false);
                setResizing(false);
                setResizeHandle(null);
                if (canEdit && onSaveState) onSaveState();
            };

            canvas.addEventListener("mousedown", handleMouseDown);
            canvas.addEventListener("mousemove", handleMouseMove);
            canvas.addEventListener("mouseup", handleMouseUp);
            canvas.addEventListener("mouseleave", handleMouseUp);

            cleanupFns.push(() => {
                canvas.removeEventListener("mousedown", handleMouseDown);
                canvas.removeEventListener("mousemove", handleMouseMove);
                canvas.removeEventListener("mouseup", handleMouseUp);
                canvas.removeEventListener("mouseleave", handleMouseUp);
            });
        });

        return () => {
            cleanupFns.forEach(fn => fn());
        };
    }, [selectedShape, splitMode, shapes, pencilActive, eraserActive, fillActive, textActive, uploadedImageUrl, loadedImage, currentImageId, borderActive, borderColor, borderSize, borderType, zoomLevel, dragging, resizing, resizeHandle, dragOffset, onShapesChange, onShapeSelect, onSaveState, setDragging, setResizing, setDragOffset, setResizeHandle, permission]);
};
