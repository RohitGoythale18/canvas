import { Command, Shape, UseShapeInteractionProps } from '@/types';
import { useEffect, useRef } from 'react';
import * as Y from 'yjs';

const MIN_SHAPE_WIDTH = 20;
const MIN_SHAPE_HEIGHT = 20;

class AddShapeCommand implements Command {
    constructor(
        private shape: Shape,
        private setShapes: React.Dispatch<React.SetStateAction<Shape[]>>,
        private yShapes?: Y.Map<Shape>
    ) { }

    execute() {
        if (this.yShapes) {
            const { imageElement: _, ...rest } = this.shape as any;
            // Also strip selection
            this.yShapes.set(this.shape.id, { ...rest, selected: false, isEditing: false });
        } else {
            this.setShapes(prev => [...prev, this.shape]);
        }
    }

    undo() {
        if (this.yShapes) {
            this.yShapes.delete(this.shape.id);
        } else {
            this.setShapes(prev => prev.filter(s => s.id !== this.shape.id));
        }
    }
}

class MoveResizeShapeCommand implements Command {
    constructor(
        private shapeId: string,
        private before: Shape,
        private after: Shape,
        private setShapes: React.Dispatch<React.SetStateAction<Shape[]>>,
        private yShapes?: Y.Map<Shape>
    ) { }

    execute() {
        if (this.yShapes) {
            const { imageElement: _, ...rest } = this.after as any;
            // Strip selection for remote
            this.yShapes.set(this.shapeId, { ...rest, selected: false });
        } else {
            this.setShapes(prev =>
                prev.map(s => (s.id === this.shapeId ? this.after : s))
            );
        }
    }

    undo() {
        if (this.yShapes) {
            const { imageElement: _, ...rest } = this.before as any;
            this.yShapes.set(this.shapeId, rest);
        } else {
            this.setShapes(prev =>
                prev.map(s => (s.id === this.shapeId ? this.before : s))
            );
        }
    }
}

export const useShapeInteraction = ({
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
    onPanelSelect,
    yShapes,
    users,
    updateCursor,
    setSelection
}: UseShapeInteractionProps) => {
    const dragStartShapeRef = useRef<Shape | null>(null);
    const activeShapeIdRef = useRef<string | null>(null);
    const activePanelIdRef = useRef<string | null>(null);
    const shapesRef = useRef(shapes);
    const draggingRef = useRef(dragging);
    const resizingRef = useRef(resizing);
    const resizeHandleRef = useRef(resizeHandle);
    const dragOffsetRef = useRef(dragOffset);
    const onShapesChangeRef = useRef(onShapesChange);
    const canEditRef = useRef(false);
    const selectedShapeRef = useRef(selectedShape);
    const lastInsertionTimeRef = useRef<number>(0);

    useEffect(() => {
        shapesRef.current = shapes;
    }, [shapes]);

    useEffect(() => {
        selectedShapeRef.current = selectedShape;
    }, [selectedShape]);

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
        const canvases = Object.entries(canvasRefs.current).filter(
            ([, canvas]) => canvas !== null
        ) as [string, HTMLCanvasElement][];
        const cleanupFns: (() => void)[] = [];

        const handleMouseDown = (e: MouseEvent, panelId: string, canvas: HTMLCanvasElement) => {
            if (pencilActive || eraserActive || fillActive || !canEditRef.current) return;

            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (canvas.height / rect.height);

            activePanelIdRef.current = panelId;
            onPanelSelect?.(panelId);

            if (selectedShapeRef.current) {
                // Debounce check: Prevent multiple clicks within 300ms
                const now = Date.now();
                if (now - lastInsertionTimeRef.current < 300) {
                    return;
                }

                const currentTool = selectedShapeRef.current;

                // Consume the selection immediately BEFORE any other operations
                selectedShapeRef.current = null;
                onShapeSelect(null as never);
                lastInsertionTimeRef.current = now;

                const maxZ = Math.max(
                    0,
                    ...shapesRef.current
                        .filter(s => s.panelId === panelId)
                        .map(s => s.zIndex ?? 0)
                );

                // Create new blank shape
                const newShape: Shape = {
                    id: `${Date.now()}-${Math.random()}`,
                    type: currentTool,
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

                executeCommand(
                    new AddShapeCommand(newShape, onShapesChangeRef.current, yShapes)
                );

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
                        dragStartShapeRef.current = { ...shape };
                        activeShapeIdRef.current = shape.id;

                        return;
                    }
                }
            }

            // Select shape & drag
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

                    dragStartShapeRef.current = { ...selected };
                    activeShapeIdRef.current = selected.id;
                }
            }
        };

        const handleMouseMoveGlobal = (e: MouseEvent) => {
            if (!activePanelIdRef.current || (!draggingRef.current && !resizingRef.current) || !canEditRef.current) return;

            const canvas = canvasRefs.current[activePanelIdRef.current];
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (canvas.height / rect.height);
            const panelId = activePanelIdRef.current;

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
            if (resizingRef.current && resizeHandleRef.current) {
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

        const handleMouseUpGlobal = () => {
            setDragging(false);
            setResizing(false);
            setResizeHandle(null);

            if (dragStartShapeRef.current && activeShapeIdRef.current) {
                const after = shapesRef.current.find(
                    s => s.id === activeShapeIdRef.current
                );

                if (after) {
                    executeCommand(
                        new MoveResizeShapeCommand(
                            after.id,
                            dragStartShapeRef.current,
                            { ...after },
                            onShapesChangeRef.current,
                            yShapes
                        )
                    );
                }
            }

            dragStartShapeRef.current = null;
            activeShapeIdRef.current = null;
            // setSelection(null); // Clear selection on mouse up? Or keep it? Usually keep it until clicked elsewhere.
        };

        const handleCanvasMouseMove = (e: MouseEvent, panelId: string, canvas: HTMLCanvasElement) => {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (canvas.height / rect.height);
            updateCursor?.(x, y, panelId);
        };

        canvases.forEach(([panelId, canvas]) => {
            const mousedownHelper = (e: MouseEvent) => {
                handleMouseDown(e, panelId, canvas);
                // After mouse down, check if a shape was selected
                const selected = shapesRef.current.find(s => s.selected && s.panelId === panelId);
                setSelection?.(selected ? selected.id : null);
            };
            const mousemoveHelper = (e: MouseEvent) => handleCanvasMouseMove(e, panelId, canvas);

            canvas.addEventListener("mousedown", mousedownHelper);
            canvas.addEventListener("mousemove", mousemoveHelper);

            cleanupFns.push(() => {
                canvas.removeEventListener("mousedown", mousedownHelper);
                canvas.removeEventListener("mousemove", mousemoveHelper);
            });
        });

        window.addEventListener("mousemove", handleMouseMoveGlobal);
        window.addEventListener("mouseup", handleMouseUpGlobal);

        return () => {
            cleanupFns.forEach(fn => fn());
            window.removeEventListener("mousemove", handleMouseMoveGlobal);
            window.removeEventListener("mouseup", handleMouseUpGlobal);
        };
    }, [selectedShape, splitMode, executeCommand, pencilActive, eraserActive, fillActive, textActive, uploadedImageUrl, loadedImage, currentImageId, borderActive, borderColor, borderSize, borderType, zoomLevel, onShapeSelect, setDragging, setResizing, setDragOffset, setResizeHandle, permission, canvasRefs, onPanelSelect, updateCursor, setSelection]);
};
