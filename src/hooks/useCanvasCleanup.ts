import { useEffect } from 'react';

interface DrawPath {
    points: { x: number; y: number }[];
    tool: 'pencil' | 'eraser';
    color?: string;
    size?: number;
}

interface UseCanvasCleanupProps {
    splitMode: string;
    setDrawings: React.Dispatch<React.SetStateAction<{ panelId: string; paths: DrawPath[] }[]>>;
    setFilledImages: React.Dispatch<React.SetStateAction<{ panelId: string; imageData: ImageData }[]>>;
}

export const useCanvasCleanup = ({
    splitMode,
    setDrawings,
    setFilledImages
}: UseCanvasCleanupProps) => {
    useEffect(() => {
        // Use requestAnimationFrame to avoid synchronous state updates
        requestAnimationFrame(() => {
            setDrawings([]);
            setFilledImages([]);
        });
    }, [splitMode, setDrawings, setFilledImages]);
};