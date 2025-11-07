'use client';
import { useState, useEffect, useRef } from "react";
import * as Shapes from './shapes/index';
import { Box } from "@mui/material";
import { Shape, FontStyles } from "../../types";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const MIN_SHAPE_WIDTH = 20;
const MIN_SHAPE_HEIGHT = 20;



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
    uploadedImageUrl?: string | null;
    loadedImage?: HTMLImageElement | null;
    backgroundColor?: Record<string, string | { start: string; end: string }>;
    onPanelSelect?: (panelId: string) => void;
    borderActive?: boolean;
    borderType?: 'solid' | 'dashed' | 'dotted';
    borderSize?: number;
    borderColor?: string;
    currentFontFeatures?: {
        fontFamily: string;
        fontSize: number;
        fontStyles: FontStyles;
        alignment: 'left' | 'center' | 'right' | 'justify';
        listType: 'bullet' | 'number' | 'none';
        textColor: string | { type: 'solid' | 'gradient'; value: string | { start: string; end: string } };
    };
    shapes: Shape[];
    onShapesChange: React.Dispatch<React.SetStateAction<Shape[]>>;
}

const Canvas = ({ splitMode = "none", pencilActive = false, fillActive = false, fillColor = "#ff0000", eraserActive = false, eraserSize = 10, selectedShape, onShapeSelect, textActive = false, uploadedImageUrl, loadedImage, backgroundColor = { default: "#ffffff" }, onPanelSelect, borderActive = false, borderType = 'solid', borderSize = 2, borderColor = '#000000', currentFontFeatures = { fontFamily: "Arial, sans-serif", fontSize: 16, fontStyles: {}, alignment: 'left' as 'left' | 'center' | 'right' | 'justify', listType: 'none' as 'bullet' | 'number' | 'none', textColor: "#000000" } }: CanvasProps) => {
    const [zoomLevel, setZoomLevel] = useState(1);
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [dragging, setDragging] = useState(false);
    const [resizing, setResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    const [textInput, setTextInput] = useState<string>("");
    const [editingShapeId, setEditingShapeId] = useState<string | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => {
            if (!wrapperRef.current) return;
            const { clientWidth, clientHeight } = wrapperRef.current;

            // Calculate zoom to fit within viewport (without changing actual canvas size)
            const scaleX = clientWidth / CANVAS_WIDTH;
            const scaleY = clientHeight / CANVAS_HEIGHT;
            setZoomLevel(Math.min(scaleX, scaleY));
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Consolidated drawing logic for all tools
    useEffect(() => {
        const canvases = document.querySelectorAll<HTMLCanvasElement>(".drawing-panel");
        const cleanupFunctions: (() => void)[] = [];

        canvases.forEach((canvas) => {
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            let drawing = false;

            const getPos = (e: MouseEvent) => ({
                x: e.offsetX * (canvas.width / canvas.clientWidth),
                y: e.offsetY * (canvas.height / canvas.clientHeight),
            });

            const startDraw = (e: MouseEvent) => {
                if (!(pencilActive || eraserActive)) return;
                drawing = true;
                ctx.beginPath();
                const { x, y } = getPos(e);
                ctx.moveTo(x, y);
            };

            const draw = (e: MouseEvent) => {
                if (!drawing) return;
                const { x, y } = getPos(e);

                if (eraserActive) {
                    ctx.globalCompositeOperation = "destination-out";
                    ctx.lineWidth = eraserSize || 10;
                    ctx.lineCap = "round";
                    ctx.lineTo(x, y);
                    ctx.stroke();
                } else if (pencilActive) {
                    ctx.globalCompositeOperation = "source-over";
                    ctx.lineWidth = 2;
                    ctx.lineCap = "round";
                    ctx.strokeStyle = "#000";
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
            };

            const endDraw = () => {
                if (drawing) {
                    drawing = false;
                    ctx.closePath();
                    ctx.globalCompositeOperation = "source-over";
                }
            };

            canvas.addEventListener("mousedown", startDraw);
            canvas.addEventListener("mousemove", draw);
            canvas.addEventListener("mouseup", endDraw);
            canvas.addEventListener("mouseleave", endDraw);

            cleanupFunctions.push(() => {
                canvas.removeEventListener("mousedown", startDraw);
                canvas.removeEventListener("mousemove", draw);
                canvas.removeEventListener("mouseup", endDraw);
                canvas.removeEventListener("mouseleave", endDraw);
            });
        });

        return () => {
            cleanupFunctions.forEach(cleanup => cleanup());
        };
    }, [pencilActive, eraserActive, eraserSize, splitMode]);

    const getBackgroundStyle = (panelId: string) => {
        const panelColor = backgroundColor[panelId] || backgroundColor.default || "#ffffff";
        if (typeof panelColor === 'string') {
            return { backgroundColor: panelColor };
        } else if (panelColor && typeof panelColor === 'object') {
            return { background: `linear-gradient(to bottom, ${panelColor.start}, ${panelColor.end})` };
        }
        return { backgroundColor: "#ffffff" };
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

    // Fill tool logic
    useEffect(() => {
        const canvases = document.querySelectorAll<HTMLCanvasElement>(".drawing-panel");
        const cleanupFunctions: (() => void)[] = [];

        canvases.forEach((canvas) => {
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const getPixel = (x: number, y: number, imageData?: ImageData) => {
                if (imageData) {
                    const index = (y * canvas.width + x) * 4;
                    return [imageData.data[index], imageData.data[index + 1], imageData.data[index + 2], imageData.data[index + 3]];
                } else {
                    const data = ctx.getImageData(x, y, 1, 1).data;
                    return [data[0], data[1], data[2], data[3]];
                }
            };

            const setPixel = (x: number, y: number, color: [number, number, number, number], imageData?: ImageData) => {
                if (imageData) {
                    const index = (y * canvas.width + x) * 4;
                    imageData.data[index] = color[0];     // R
                    imageData.data[index + 1] = color[1]; // G
                    imageData.data[index + 2] = color[2]; // B
                    imageData.data[index + 3] = color[3]; // A
                } else {
                    const pixelImageData = ctx.createImageData(1, 1);
                    pixelImageData.data.set(color);
                    ctx.putImageData(pixelImageData, x, y);
                }
            };

            const colorsMatch = (a: number[], b: number[]) =>
                a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];

            const hexToRGBA = (hex: string): [number, number, number, number] => {
                const bigint = parseInt(hex.slice(1), 16);
                const r = (bigint >> 16) & 255;
                const g = (bigint >> 8) & 255;
                const b = bigint & 255;
                return [r, g, b, 255];
            };

            const floodFill = (startX: number, startY: number, fillColor: string) => {
                const targetColor = getPixel(startX, startY);
                const replacementColor = hexToRGBA(fillColor);

                if (colorsMatch(targetColor, replacementColor)) return;

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const visited = new Uint8Array(canvas.width * canvas.height);
                const stack: [number, number][] = [[startX, startY]];
                let filledPixels = 0;
                const MAX_FILL_PIXELS = 2000000; // Reasonable limit for performance

                while (stack.length > 0 && filledPixels < MAX_FILL_PIXELS) {
                    const [x, y] = stack.pop()!;
                    const index = y * canvas.width + x;

                    if (visited[index]) continue;

                    const currentColor = getPixel(x, y);
                    if (!colorsMatch(currentColor, targetColor)) continue;

                    visited[index] = 1;
                    setPixel(x, y, replacementColor, imageData);
                    filledPixels++;

                    // Add neighbors to stack
                    if (x > 0) stack.push([x - 1, y]);
                    if (x < canvas.width - 1) stack.push([x + 1, y]);
                    if (y > 0) stack.push([x, y - 1]);
                    if (y < canvas.height - 1) stack.push([x, y + 1]);
                }

                // Apply all changes at once for better performance
                ctx.putImageData(imageData, 0, 0);
            };

            const handleFillClick = (e: MouseEvent) => {
                if (!fillActive) return;
                const rect = canvas.getBoundingClientRect();
                const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
                const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
                if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;
                floodFill(x, y, fillColor || "#ff0000");
            };

            canvas.addEventListener("click", handleFillClick);

            cleanupFunctions.push(() => {
                canvas.removeEventListener("click", handleFillClick);
            });
        });

        return () => {
            cleanupFunctions.forEach(cleanup => cleanup());
        };
    }, [splitMode, fillActive, fillColor]);

    // Text creation logic
    useEffect(() => {
        const canvases = document.querySelectorAll<HTMLCanvasElement>(".drawing-panel");
        const cleanupFunctions: (() => void)[] = [];

        canvases.forEach((canvas) => {
            const handleMouseDown = (e: MouseEvent) => {
                if (!textActive) return;

                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                const mouseX = (e.clientX - rect.left) * scaleX;
                const mouseY = (e.clientY - rect.top) * scaleY;

                // Check if clicking on existing text
                let clickedOnText = false;
                shapes.forEach((shape) => {
                    if (shape.type === "text") {
                        const textHeight = shape.fontSize || 16;

                        if (mouseX >= shape.x && mouseX <= shape.x + shape.width &&
                            mouseY >= shape.y && mouseY <= shape.y + shape.height) {
                            clickedOnText = true;

                            // Start editing existing text
                            setShapes(prev => prev.map(s =>
                                s.id === shape.id
                                    ? { ...s, isEditing: true, selected: true }
                                    : { ...s, isEditing: false, selected: false }
                            ));
                            setTextInput(shape.text || "");
                            setEditingShapeId(shape.id);
                        }
                    }
                });

                if (!clickedOnText) {
                    // Create new text shape
                    const panelId = canvas.getAttribute("data-panel-id") || "default";
                    const newShape: Shape = {
                        id: `text-${Date.now()}-${Math.random()}`,
                        type: "text",
                        x: mouseX,
                        y: mouseY,
                        width: Math.max(200, MIN_SHAPE_WIDTH), // Increased default width
                        height: Math.max(60, MIN_SHAPE_HEIGHT), // Increased default height
                        selected: true,
                        panelId: panelId,
                        text: "",
                        fontSize: currentFontFeatures.fontSize,
                        fontFamily: currentFontFeatures.fontFamily,
                        textColor: currentFontFeatures.textColor,
                        fontStyles: currentFontFeatures.fontStyles,
                        textAlignment: currentFontFeatures.alignment,
                        listType: currentFontFeatures.listType,
                        isEditing: true,
                    };

                    setShapes(prev => [...prev.map(s => ({ ...s, selected: false })), newShape]);
                    setTextInput("");
                    setEditingShapeId(newShape.id);
                }
            };

            canvas.addEventListener("mousedown", handleMouseDown);
            cleanupFunctions.push(() => {
                canvas.removeEventListener("mousedown", handleMouseDown);
            });
        });

        return () => {
            cleanupFunctions.forEach(cleanup => cleanup());
        };
    }, [textActive, shapes, currentFontFeatures]);

    // Consolidated text input handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const editingShape = shapes.find(shape => shape.isEditing && shape.type === "text");

            if (!editingShape) return;

            // Prevent default for these keys to avoid browser behavior
            if (e.key === "Escape" || e.key === "Enter") {
                e.preventDefault();
                // Finish editing
                setShapes(prev => prev.map(shape =>
                    shape.id === editingShape.id
                        ? {
                            ...shape,
                            isEditing: false,
                            text: textInput,
                            // Ensure font features are preserved
                            fontSize: currentFontFeatures.fontSize,
                            fontFamily: currentFontFeatures.fontFamily,
                            textColor: currentFontFeatures.textColor,
                            fontStyles: currentFontFeatures.fontStyles,
                            textAlignment: currentFontFeatures.alignment,
                            listType: currentFontFeatures.listType
                        }
                        : shape
                ));
                setEditingShapeId(null);
            } else if (e.key === "Backspace") {
                e.preventDefault();
                setTextInput(prev => prev.slice(0, -1));
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                setTextInput(prev => prev + e.key);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [shapes, textInput, currentFontFeatures]);

    // Focus management for text input
    useEffect(() => {
        if (editingShapeId) {
            const canvas = document.querySelector<HTMLCanvasElement>(".drawing-panel");
            if (canvas) {
                canvas.focus();
            }
        }
    }, [editingShapeId]);

    // Force re-render during text editing for smooth cursor
    useEffect(() => {
        if (!editingShapeId) return;

        const interval = setInterval(() => {
            // This will force a re-render of the canvas, making the cursor blink
            setShapes(prev => [...prev]);
        }, 500);

        return () => clearInterval(interval);
    }, [editingShapeId]);

    // Delete selected shapes on Delete or Backspace key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Delete" || e.key === "Backspace") {
                const hasEditingText = shapes.some(shape => shape.isEditing && shape.type === "text");
                if (!hasEditingText) {
                    setShapes(prev => prev.filter(shape => !shape.selected));
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [shapes]);

    // Shape placement and interaction logic
    useEffect(() => {
        const canvases = document.querySelectorAll<HTMLCanvasElement>(".drawing-panel");
        const cleanupFns: (() => void)[] = [];

        canvases.forEach((canvas) => {
            const handleMouseDown = (e: MouseEvent) => {
                if (pencilActive || eraserActive || fillActive || textActive) return;

                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) * (canvas.width / rect.width);
                const y = (e.clientY - rect.top) * (canvas.height / rect.height);

                if (selectedShape) {
                    // Place new shape
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
                        imageUrl: uploadedImageUrl || undefined,
                        imageElement: loadedImage || undefined,
                        borderType: undefined,
                        borderSize: undefined,
                        borderColor: undefined,
                    };
                    setShapes(prev => [...prev, newShape]);
                    onShapeSelect(null as never);
                    return;
                }

                // Check for resize handles
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

                // Check for shape selection
                let selectedShapeId: string | null = null;
                shapes.forEach((shape) => {
                    if (x >= shape.x && x <= shape.x + shape.width &&
                        y >= shape.y && y <= shape.y + shape.height) {
                        selectedShapeId = shape.id;
                    }
                });

                setShapes(prev => prev.map(shape => ({
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
                    // Clear selection if clicking on empty space
                    setShapes(prev => prev.map(shape => ({
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
                    setShapes(prev => prev.map(shape => {
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
                    setShapes(prev => prev.map(shape => {
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

                            // Enforce minimum dimensions
                            newWidth = Math.max(MIN_SHAPE_WIDTH, newWidth);
                            newHeight = Math.max(MIN_SHAPE_HEIGHT, newHeight);

                            // Adjust position for top-left and bottom-left handles to maintain minimum size
                            if (resizeHandle === 'top-left') {
                                if (shape.x + shape.width - newX < MIN_SHAPE_WIDTH) {
                                    newX = shape.x + shape.width - MIN_SHAPE_WIDTH;
                                }
                                if (shape.y + shape.height - newY < MIN_SHAPE_HEIGHT) {
                                    newY = shape.y + shape.height - MIN_SHAPE_HEIGHT;
                                }
                            } else if (resizeHandle === 'bottom-left') {
                                if (shape.x + shape.width - newX < MIN_SHAPE_WIDTH) {
                                    newX = shape.x + shape.width - MIN_SHAPE_WIDTH;
                                }
                            } else if (resizeHandle === 'top-right') {
                                if (shape.y + shape.height - newY < MIN_SHAPE_HEIGHT) {
                                    newY = shape.y + shape.height - MIN_SHAPE_HEIGHT;
                                }
                            }

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
    }, [selectedShape, splitMode, onShapeSelect, shapes, dragging, resizing, resizeHandle, dragOffset, pencilActive, eraserActive, fillActive, textActive, uploadedImageUrl, loadedImage, borderActive, borderColor, borderSize, borderType, zoomLevel]);

    // Update border properties on selected shapes when border settings change
    useEffect(() => {
        setShapes(prev => prev.map(shape => ({
            ...shape,
            borderType: shape.selected && borderActive ? borderType : shape.borderType,
            borderSize: shape.selected && borderActive ? borderSize : shape.borderSize,
            borderColor: shape.selected && borderActive ? borderColor : shape.borderColor,
        })));
    }, [borderActive, borderType, borderSize, borderColor]);

    // Update font features on selected text shapes when font features change
    useEffect(() => {
        setShapes(prev => prev.map(shape => {
            if (shape.selected && shape.type === "text") {
                return {
                    ...shape,
                    fontSize: currentFontFeatures.fontSize,
                    fontFamily: currentFontFeatures.fontFamily,
                    textColor: currentFontFeatures.textColor,
                    fontStyles: currentFontFeatures.fontStyles,
                    textAlignment: currentFontFeatures.alignment,
                    listType: currentFontFeatures.listType,
                };
            }
            return shape;
        }));
    }, [currentFontFeatures]);

    // Shape rendering logic
    useEffect(() => {
        const canvases = document.querySelectorAll<HTMLCanvasElement>(".drawing-panel");

        canvases.forEach((canvas) => {
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const panelId = canvas.getAttribute("data-panel-id") || "default";

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw shapes for this panel only
            shapes.filter(shape => shape.panelId === panelId).forEach((shape) => {
                switch (shape.type) {
                    case "Rectangle":
                        Shapes.drawRectangleShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Square":
                        Shapes.drawSquareShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Circle":
                        Shapes.drawCircleShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Triangle":
                        Shapes.drawTriangleShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Line":
                        Shapes.drawLineShape(ctx, shape.x, shape.y, shape.width, shape.height, undefined, undefined, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Diamond":
                        Shapes.drawDiamondShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Star":
                        Shapes.drawStarShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Ellipse / Oval":
                        Shapes.drawEllipseShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Diamond / Rhombus":
                        Shapes.drawDiamondShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Hexagon":
                        Shapes.drawHexagonShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Octagon":
                        Shapes.drawOctagonShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Parallelogram":
                        Shapes.drawParallelogramShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Pentagon":
                        Shapes.drawPentagonShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Polygon":
                        Shapes.drawPolygonShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Right Triangle":
                        Shapes.drawRightTriangleShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Trapezoid":
                        Shapes.drawTrapezoidShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Arc":
                        Shapes.drawArcShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Chord":
                        Shapes.drawChordShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Cone":
                        Shapes.drawConeShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor);
                        break;
                    case "Crescent":
                        Shapes.drawCrescentShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor);
                        break;
                    case "Cube (3D)":
                        Shapes.drawCubeShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Cylinder":
                        Shapes.drawCylinderShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Pyramid":
                        Shapes.drawPyramidShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Ring / Donut":
                        Shapes.drawRingShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Sector":
                        Shapes.drawSectorShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Sphere":
                        Shapes.drawSphereShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Star (5-point)":
                        Shapes.drawStar5Shape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Star (6-point)":
                        Shapes.drawStar6Shape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Burst / Explosion":
                        Shapes.drawBurstShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Heart":
                        Shapes.drawHeartShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Cloud":
                        Shapes.drawCloudShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Banner":
                        Shapes.drawBannerShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Badge":
                        Shapes.drawBadgeShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Speech Bubble":
                        Shapes.drawSpeechBubbleShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "Callout":
                        Shapes.drawCalloutShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor, shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
                        break;
                    case "text":
                        // Apply font styles with all font features
                        const fontFamily = shape.fontFamily || "sans-serif";
                        const fontSize = shape.fontSize || 16;
                        const fontWeight = shape.fontStyles?.bold ? "bold" : "normal";
                        const fontStyle = shape.fontStyles?.italic ? "italic" : "normal";
                        const textDecoration = [
                            shape.fontStyles?.underline ? "underline" : "",
                            shape.fontStyles?.strikethrough ? "line-through" : ""
                        ].filter(Boolean).join(" ") || "none";

                        // Build the complete font string
                        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
                        ctx.textBaseline = "top";

                        // Apply text alignment
                        const textAlign = shape.textAlignment || 'left';
                        // CanvasRenderingContext2D.textAlign does not support 'justify', map it to a supported value
                        const canvasTextAlign = textAlign === 'justify' ? 'left' : (textAlign as CanvasTextAlign);
                        ctx.textAlign = canvasTextAlign;

                        // Apply text color (solid or gradient)
                        if (typeof shape.textColor === 'string') {
                            ctx.fillStyle = shape.textColor;
                        } else if (shape.textColor && typeof shape.textColor === 'object' && shape.textColor.type === 'gradient') {
                            const gradientValue = shape.textColor.value as { start: string; end: string };
                            const gradient = ctx.createLinearGradient(
                                shape.x,
                                shape.y,
                                shape.x + shape.width,
                                shape.y + shape.height
                            );
                            gradient.addColorStop(0, gradientValue.start);
                            gradient.addColorStop(1, gradientValue.end);
                            ctx.fillStyle = gradient;
                        } else {
                            ctx.fillStyle = "#000000";
                        }

                        const textHeight = fontSize;
                        const lineHeight = textHeight + 4;
                        const maxWidth = shape.width - 8;

                        if (shape.isEditing || shape.selected) {
                            // Draw background for the textbox
                            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                            ctx.fillRect(shape.x, shape.y, shape.width, shape.height);

                            // Draw border
                            ctx.strokeStyle = "#007bff";
                            ctx.lineWidth = 2;
                            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);

                            // Reset fill style for text
                            if (typeof shape.textColor === 'string') {
                                ctx.fillStyle = shape.textColor;
                            } else if (shape.textColor && typeof shape.textColor === 'object' && shape.textColor.type === 'gradient') {
                                const gradientValue = shape.textColor.value as { start: string; end: string };
                                const gradient = ctx.createLinearGradient(
                                    shape.x,
                                    shape.y,
                                    shape.x + shape.width,
                                    shape.y + shape.height
                                );
                                gradient.addColorStop(0, gradientValue.start);
                                gradient.addColorStop(1, gradientValue.end);
                                ctx.fillStyle = gradient;
                            } else {
                                ctx.fillStyle = "#000000";
                            }
                        }

                        // Clip text to the box to prevent overflow
                        ctx.save();
                        ctx.beginPath();
                        ctx.rect(shape.x, shape.y, shape.width, shape.height);
                        ctx.clip();

                        const wrapText = (text: string, isEditing: boolean = false) => {
                            const lines: string[] = [];
                            let currentLine = '';
                            const words = text.split(' ');

                            const breakLineIfNeeded = (line: string) => {
                                if (ctx.measureText(line).width <= maxWidth) return [line];
                                const brokenLines: string[] = [];
                                let current = '';
                                for (let char of line) {
                                    if (ctx.measureText(current + char).width <= maxWidth) {
                                        current += char;
                                    } else {
                                        if (current) brokenLines.push(current);
                                        current = char;
                                    }
                                }
                                if (current) brokenLines.push(current);
                                return brokenLines;
                            };

                            for (let i = 0; i < words.length; i++) {
                                const word = words[i];
                                // Handle line breaks for list items
                                if (shape.listType !== 'none' && word.includes('\n')) {
                                    const parts = word.split('\n');
                                    for (let j = 0; j < parts.length; j++) {
                                        if (j > 0) {
                                            lines.push(currentLine);
                                            currentLine = '';
                                        }
                                        const testLine = currentLine + (currentLine ? ' ' : '') + parts[j];
                                        const metrics = ctx.measureText(testLine);

                                        if (metrics.width > maxWidth && currentLine !== '') {
                                            lines.push(currentLine);
                                            const broken = breakLineIfNeeded(parts[j]);
                                            lines.push(...broken.slice(0, -1));
                                            currentLine = broken[broken.length - 1] || '';
                                        } else {
                                            currentLine = testLine;
                                            const broken = breakLineIfNeeded(currentLine);
                                            if (broken.length > 1) {
                                                lines.push(...broken.slice(0, -1));
                                                currentLine = broken[broken.length - 1];
                                            }
                                        }
                                    }
                                } else {
                                    const testLine = currentLine + (currentLine ? ' ' : '') + word;
                                    const metrics = ctx.measureText(testLine);

                                    if (metrics.width > maxWidth && currentLine !== '') {
                                        lines.push(currentLine);
                                        const broken = breakLineIfNeeded(word);
                                        lines.push(...broken.slice(0, -1));
                                        currentLine = broken[broken.length - 1] || '';
                                    } else {
                                        currentLine = testLine;
                                        const broken = breakLineIfNeeded(currentLine);
                                        if (broken.length > 1) {
                                            lines.push(...broken.slice(0, -1));
                                            currentLine = broken[broken.length - 1];
                                        }
                                    }
                                }
                            }

                            if (currentLine) {
                                const broken = breakLineIfNeeded(currentLine);
                                lines.push(...broken);
                            }

                            // Add list markers
                            if (shape.listType !== 'none') {
                                for (let i = 0; i < lines.length; i++) {
                                    if (shape.listType === 'bullet') {
                                        lines[i] = '• ' + lines[i];
                                    } else if (shape.listType === 'number') {
                                        lines[i] = (i + 1) + '. ' + lines[i];
                                    }
                                }
                            }

                            // If editing, add cursor to the last line
                            if (isEditing) {
                                const lastLineIndex = lines.length - 1;
                                lines[lastLineIndex] += (Date.now() % 1000 < 500 ? "|" : "");
                            }

                            return lines;
                        };

                        let lines: string[];
                        if (shape.isEditing) {
                            const currentText = shape.id === editingShapeId ? textInput : (shape.text || "");
                            lines = wrapText(currentText, true);
                        } else {
                            lines = wrapText(shape.text || "");
                        }

                        // Calculate text positioning based on alignment
                        const getTextXPosition = (line: string) => {
                            switch (textAlign) {
                                case 'center':
                                    return shape.x + (shape.width / 2);
                                case 'right':
                                    return shape.x + shape.width - 4;
                                case 'left':
                                default:
                                    return shape.x + 4;
                            }
                        };

                        // Draw each line with proper alignment and formatting
                        let y = shape.y + textHeight;
                        for (const line of lines) {
                            if (y > shape.y + shape.height - textHeight) break; // Stop if beyond box height

                            const xPos = getTextXPosition(line);

                            // Draw the text
                            ctx.fillText(line, xPos, y);

                            // Draw text decorations (underline and strikethrough)
                            if (shape.fontStyles) {
                                const metrics = ctx.measureText(line);
                                const textY = y;

                                if (shape.fontStyles.underline) {
                                    ctx.strokeStyle = ctx.fillStyle as string;
                                    ctx.lineWidth = 1;
                                    ctx.beginPath();
                                    ctx.moveTo(xPos, textY + textHeight + 2);
                                    ctx.lineTo(xPos + metrics.width, textY + textHeight + 2);
                                    ctx.stroke();
                                }

                                if (shape.fontStyles.strikethrough) {
                                    ctx.strokeStyle = ctx.fillStyle as string;
                                    ctx.lineWidth = 1;
                                    ctx.beginPath();
                                    ctx.moveTo(xPos, textY + (textHeight / 2));
                                    ctx.lineTo(xPos + metrics.width, textY + (textHeight / 2));
                                    ctx.stroke();
                                }
                            }

                            y += lineHeight;
                        }

                        ctx.restore();

                        // Reset text alignment to default for other shapes
                        ctx.textAlign = 'left';
                        break;
                    // Note: Other shape types (Linear, Flowchart, etc.) still use SVG and need to be updated separately
                    default:
                        // For now, skip unsupported shapes to avoid errors
                        break;
                }

                // Draw selection outline and handles
                if (shape.selected) {
                    ctx.strokeStyle = "#007bff";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);

                    // Draw resize handles
                    const handleSize = 8;
                    ctx.fillStyle = "#007bff";
                    // Top-left
                    ctx.fillRect(shape.x - handleSize / 2, shape.y - handleSize / 2, handleSize, handleSize);
                    // Top-right
                    ctx.fillRect(shape.x + shape.width - handleSize / 2, shape.y - handleSize / 2, handleSize, handleSize);
                    // Bottom-left
                    ctx.fillRect(shape.x - handleSize / 2, shape.y + shape.height - handleSize / 2, handleSize, handleSize);
                    // Bottom-right
                    ctx.fillRect(shape.x + shape.width - handleSize / 2, shape.y + shape.height - handleSize / 2, handleSize, handleSize);
                }
            });
        });
    }, [shapes, splitMode, textInput, editingShapeId]);

    const renderPanels = () => {
        switch (splitMode) {
            case "2-way":
                return (
                    <Box
                        id="canvas-container"
                        sx={{
                            width: `${CANVAS_WIDTH}px`,
                            height: `${CANVAS_HEIGHT}px`,
                            transform: `scale(${zoomLevel})`,
                            transformOrigin: "center center",
                            display: 'flex',
                        }}
                    >
                        {renderPanelCanvas(0.5, 1, "panel-1")}
                        {renderPanelCanvas(0.5, 1, "panel-2")}
                    </Box>
                );
            case "3-way-left":
                return (
                    <Box
                        id="canvas-container"
                        sx={{
                            width: `${CANVAS_WIDTH}px`,
                            height: `${CANVAS_HEIGHT}px`,
                            transform: `scale(${zoomLevel})`,
                            transformOrigin: "center center",
                            display: 'flex',
                        }}
                    >
                        {/* Left single panel */}
                        <Box sx={{ flex: 1, display: 'flex' }}>
                            {renderPanelCanvas(1, 1, "panel-1")}
                        </Box>

                        {/* Right stacked panels */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <Box sx={{ flex: 1, display: 'flex' }}>{renderPanelCanvas(1, 1, "panel-2")}</Box>
                            <Box sx={{ flex: 1, display: 'flex' }}>{renderPanelCanvas(1, 1, "panel-3")}</Box>
                        </Box>
                    </Box>
                );
            case "3-way-right":
                return (
                    <Box
                        id="canvas-container"
                        sx={{
                            width: `${CANVAS_WIDTH}px`,
                            height: `${CANVAS_HEIGHT}px`,
                            transform: `scale(${zoomLevel})`,
                            transformOrigin: "center center",
                            display: 'flex',
                        }}
                    >
                        {/* Left stacked panels */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <Box sx={{ flex: 1, display: 'flex' }}>{renderPanelCanvas(1, 1, "panel-1")}</Box>
                            <Box sx={{ flex: 1, display: 'flex' }}>{renderPanelCanvas(1, 1, "panel-2")}</Box>
                        </Box>

                        {/* Right single panel */}
                        <Box sx={{ flex: 1, display: 'flex' }}>
                            {renderPanelCanvas(1, 1, "panel-3")}
                        </Box>
                    </Box>
                );
            case "4-way":
                return (
                    <Box
                        id="canvas-container"
                        sx={{
                            width: `${CANVAS_WIDTH}px`,
                            height: `${CANVAS_HEIGHT}px`,
                            transform: `scale(${zoomLevel})`,
                            transformOrigin: "center center",
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gridTemplateRows: 'repeat(2, 1fr)',
                        }}
                    >
                        {renderPanelCanvas(0.5, 0.5, "panel-1")}
                        {renderPanelCanvas(0.5, 0.5, "panel-2")}
                        {renderPanelCanvas(0.5, 0.5, "panel-3")}
                        {renderPanelCanvas(0.5, 0.5, "panel-4")}
                    </Box>
                );
            default:
                return (
                    <Box
                        id="canvas-container"
                        sx={{
                            width: `${CANVAS_WIDTH}px`,
                            height: `${CANVAS_HEIGHT}px`,
                            transform: `scale(${zoomLevel})`,
                            transformOrigin: "center center",
                        }}
                    >
                        {/* Original Canvas */}
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
            {/* Main Canvas */}
            <Box>
                {renderPanels()}
            </Box>
        </Box>
    );
};

export default Canvas;