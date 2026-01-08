// src/hooks/useShapeInteraction.ts
import { Shape, UseShapeInteractionProps } from '@/types';
import { useEffect, useRef } from 'react';

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
    const shapesRef = useRef(shapes);
    const draggingRef = useRef(dragging);
    const resizingRef = useRef(resizing);
    const resizeHandleRef = useRef(resizeHandle);
    const dragOffsetRef = useRef(dragOffset);
    const onShapesChangeRef = useRef(onShapesChange);
    const canEditRef = useRef(false);

    // const canEdit = permission === 'OWNER' || permission === 'WRITE';

    useEffect(() => {
        shapesRef.current = shapes;
    }, [shapes]);

    useEffect(() => {
        draggingRef.current = dragging;
        resizingRef.current = resizing;
        resizeHandleRef.current = resizeHandle;
        dragOffsetRef.current = dragOffset;
        onShapesChangeRef.current = onShapesChange;
    }, [dragging, resizing, resizeHandle, dragOffset, onShapesChange]);

    useEffect(() => {
        canEditRef.current =
            permission === 'OWNER' || permission === 'WRITE';
    }, [permission]);

    useEffect(() => {
        const canvases = document.querySelectorAll<HTMLCanvasElement>(".drawing-panel");
        const cleanupFns: (() => void)[] = [];

        canvases.forEach((canvas) => {
            const panelId = canvas.getAttribute("data-panel-id") || "default";

            const handleMouseDown = (e: MouseEvent) => {
                if (pencilActive || eraserActive || fillActive || textActive || !canEditRef.current) return;

                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) * (canvas.width / rect.width);
                const y = (e.clientY - rect.top) * (canvas.height / rect.height);

                if (selectedShape) {
                    const maxZ = Math.max(
                        0,
                        ...shapesRef.current
                            .filter(s => s.panelId === panelId)
                            .map(s => s.zIndex ?? 0)
                    );

                    // Create new blank shape
                    const newShape: Shape = {
                        id: `${Date.now()}-${Math.random()}`,
                        type: selectedShape,
                        x: x - 40,
                        y: y - 40,
                        width: Math.max(80, MIN_SHAPE_WIDTH),
                        height: Math.max(80, MIN_SHAPE_HEIGHT),
                        selected: false,
                        panelId,
                        fillColor: "#60a5fa",
                        imageUrl: undefined,
                        imageId: undefined,
                        imageElement: undefined,
                        borderType: undefined,
                        borderSize: undefined,
                        borderColor: undefined,
                        zIndex: maxZ + 1,
                    };
                    onShapesChangeRef.current(prev => [...prev, newShape]);
                    onShapeSelect(null as never);
                    return;
                }

                // Resize handles
                const handleSize = 8;

                for (const shape of shapesRef.current) {
                    if (!shape.selected || shape.panelId !== panelId) continue;

                    const handles = [
                        { name: 'top-left', x: shape.x, y: shape.y },
                        {
                            name: 'top-right',
                            x: shape.x + shape.width,
                            y: shape.y,
                        },
                        {
                            name: 'bottom-left',
                            x: shape.x,
                            y: shape.y + shape.height,
                        },
                        {
                            name: 'bottom-right',
                            x: shape.x + shape.width,
                            y: shape.y + shape.height,
                        },
                    ];

                    for (const handle of handles) {
                        if (
                            x >= handle.x - handleSize / 2 &&
                            x <= handle.x + handleSize / 2 &&
                            y >= handle.y - handleSize / 2 &&
                            y <= handle.y + handleSize / 2
                        ) {
                            setResizing(true);
                            setResizeHandle(handle.name);
                            setDragOffset({
                                x: x - handle.x,
                                y: y - handle.y,
                            });
                            return;
                        }
                    }
                }

                // Select shape
                let selectedId: string | null = null;

                for (const shape of shapesRef.current) {
                    if (shape.panelId !== panelId) continue;

                    if (
                        x >= shape.x &&
                        x <= shape.x + shape.width &&
                        y >= shape.y &&
                        y <= shape.y + shape.height
                    ) {
                        selectedId = shape.id;
                    }
                }

                onShapesChangeRef.current(prev =>
                    prev.map(shape => ({
                        ...shape,
                        selected:
                            shape.panelId === panelId &&
                            shape.id === selectedId,
                    }))
                );

                if (selectedId) {
                    const selected = shapesRef.current.find(
                        s => s.id === selectedId
                    );
                    if (selected) {
                        setDragging(true);
                        setDragOffset({
                            x: x - selected.x,
                            y: y - selected.y,
                        });
                    }
                }
            };

            // Mouse move and up handlers
            const handleMouseMove = (e: MouseEvent) => {
                if (pencilActive || eraserActive || fillActive || textActive || !canEditRef.current) return;

                const rect = canvas.getBoundingClientRect();
                const x =
                    (e.clientX - rect.left) *
                    (canvas.width / rect.width);
                const y =
                    (e.clientY - rect.top) *
                    (canvas.height / rect.height);

                /* ---- DRAG ---- */
                if (draggingRef.current) {
                    onShapesChangeRef.current(prev =>
                        prev.map(shape => {
                            if (
                                shape.selected &&
                                shape.panelId === panelId
                            ) {
                                return {
                                    ...shape,
                                    x: x - dragOffsetRef.current.x,
                                    y: y - dragOffsetRef.current.y,
                                };
                            }
                            return shape;
                        })
                    );
                }

                /* ---- RESIZE ---- */
                if (
                    resizingRef.current &&
                    resizeHandleRef.current
                ) {
                    onShapesChangeRef.current(prev =>
                        prev.map(shape => {
                            if (
                                !shape.selected ||
                                shape.panelId !== panelId
                            )
                                return shape;

                            let newX = shape.x;
                            let newY = shape.y;
                            let newWidth = shape.width;
                            let newHeight = shape.height;

                            switch (resizeHandleRef.current) {
                                case 'top-left':
                                    newX = x - dragOffsetRef.current.x;
                                    newY = y - dragOffsetRef.current.y;
                                    newWidth =
                                        shape.x +
                                        shape.width -
                                        newX;
                                    newHeight =
                                        shape.y +
                                        shape.height -
                                        newY;
                                    break;
                                case 'top-right':
                                    newY = y - dragOffsetRef.current.y;
                                    newWidth =
                                        x -
                                        dragOffsetRef.current.x -
                                        shape.x;
                                    newHeight =
                                        shape.y +
                                        shape.height -
                                        newY;
                                    break;
                                case 'bottom-left':
                                    newX = x - dragOffsetRef.current.x;
                                    newWidth =
                                        shape.x +
                                        shape.width -
                                        newX;
                                    newHeight =
                                        y -
                                        dragOffsetRef.current.y -
                                        shape.y;
                                    break;
                                case 'bottom-right':
                                    newWidth =
                                        x -
                                        dragOffsetRef.current.x -
                                        shape.x;
                                    newHeight =
                                        y -
                                        dragOffsetRef.current.y -
                                        shape.y;
                                    break;
                            }

                            return {
                                ...shape,
                                x: newX,
                                y: newY,
                                width: Math.max(
                                    MIN_SHAPE_WIDTH,
                                    newWidth
                                ),
                                height: Math.max(
                                    MIN_SHAPE_HEIGHT,
                                    newHeight
                                ),
                            };
                        })
                    );
                }
            };

            const handleMouseUp = () => {
                setDragging(false);
                setResizing(false);
                setResizeHandle(null);
                if (canEditRef.current && onSaveState) onSaveState();
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
    }, [selectedShape, splitMode, pencilActive, eraserActive, fillActive, textActive, uploadedImageUrl, loadedImage, currentImageId, borderActive, borderColor, borderSize, borderType, zoomLevel, onShapeSelect, onSaveState, setDragging, setResizing, setDragOffset, setResizeHandle, permission]);
}; 
