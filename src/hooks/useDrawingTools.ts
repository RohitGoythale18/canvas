import { useEffect } from 'react';

interface DrawingPath {
    points: { x: number; y: number }[];
    tool: 'pencil' | 'eraser';
    color?: string;
    size?: number;
}

interface UseDrawingToolsProps {
    pencilActive: boolean;
    eraserActive: boolean;
    eraserSize: number;
    splitMode: string;
    setDrawings: React.Dispatch<React.SetStateAction<{ panelId: string; paths: DrawingPath[] }[]>>;
}

export const useDrawingTools = ({
    pencilActive,
    eraserActive,
    eraserSize,
    splitMode,
    setDrawings
}: UseDrawingToolsProps) => {
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
                const panelId = canvas.getAttribute("data-panel-id") || "default";
                const { x, y } = getPos(e);
                const newPath: DrawingPath = {
                    points: [{ x, y }],
                    tool: pencilActive ? 'pencil' as const : 'eraser' as const,
                    color: pencilActive ? "#000" : undefined,
                    size: eraserActive ? eraserSize : 2
                };
                setDrawings(prev => {
                    const existing = prev.find(d => d.panelId === panelId);
                    if (existing) {
                        return prev.map(d => d.panelId === panelId ? { ...d, paths: [...d.paths, newPath] } : d);
                    } else {
                        return [...prev, { panelId, paths: [newPath] }];
                    }
                });
            };

            const draw = (e: MouseEvent) => {
                if (!drawing) return;
                const panelId = canvas.getAttribute("data-panel-id") || "default";
                const { x, y } = getPos(e);
                setDrawings(prev => prev.map(d => {
                    if (d.panelId === panelId && d.paths.length > 0) {
                        const lastPath = d.paths[d.paths.length - 1];
                        return { ...d, paths: [...d.paths.slice(0, -1), { ...lastPath, points: [...lastPath.points, { x, y }] }] };
                    }
                    return d;
                }));
            };

            const endDraw = () => {
                if (drawing) {
                    drawing = false;
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
    }, [pencilActive, eraserActive, eraserSize, splitMode, setDrawings]);
};