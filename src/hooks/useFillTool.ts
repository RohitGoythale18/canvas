import { useEffect } from 'react';
import { Shape } from '../types';

interface UseFillToolProps {
    splitMode: string;
    fillActive: boolean;
    fillColor: string;
    setFilledImages: React.Dispatch<React.SetStateAction<{ panelId: string; imageData: ImageData }[]>>;
    shapes: Shape[];
    onShapesChange: React.Dispatch<React.SetStateAction<Shape[]>>;
}

export const useFillTool = ({
    splitMode,
    fillActive,
    fillColor,
    setFilledImages,
    shapes,
    onShapesChange
}: UseFillToolProps) => {
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

                // Store the filled image data
                const panelId = canvas.getAttribute("data-panel-id") || "default";
                setFilledImages(prev => {
                    const existing = prev.find(f => f.panelId === panelId);
                    if (existing) {
                        return prev.map(f => f.panelId === panelId ? { ...f, imageData } : f);
                    } else {
                        return [...prev, { panelId, imageData }];
                    }
                });

                // Apply all changes at once for better performance
                ctx.putImageData(imageData, 0, 0);
            };

            const handleFillClick = (e: MouseEvent) => {
                if (!fillActive) return;
                const rect = canvas.getBoundingClientRect();
                const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
                const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
                if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;

                const panelId = canvas.getAttribute("data-panel-id") || "default";
                const panelShapes = shapes.filter(shape => shape.panelId === panelId);

                // Check if click is inside a shape
                let clickedShape: Shape | null = null;
                for (const shape of panelShapes) {
                    if (x >= shape.x && x <= shape.x + shape.width &&
                        y >= shape.y && y <= shape.y + shape.height) {
                        clickedShape = shape;
                        break;
                    }
                }

                if (clickedShape) {
                    // Update shape's fillColor
                    onShapesChange(prev => prev.map(shape =>
                        shape.id === clickedShape!.id
                            ? { ...shape, fillColor: fillColor || "#ff0000" }
                            : shape
                    ));
                } else {
                    // Perform flood fill on canvas
                    floodFill(x, y, fillColor || "#ff0000");
                }
            };

            canvas.addEventListener("click", handleFillClick);

            cleanupFunctions.push(() => {
                canvas.removeEventListener("click", handleFillClick);
            });
        });

        return () => {
            cleanupFunctions.forEach(cleanup => cleanup());
        };
    }, [splitMode, fillActive, fillColor, setFilledImages, shapes, onShapesChange]);
};