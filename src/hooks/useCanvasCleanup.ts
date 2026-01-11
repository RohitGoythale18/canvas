import { useEffect } from 'react';
import { UseCanvasCleanupProps } from '@/types';

export const useCanvasCleanup = ({ splitMode, setDrawings, setFilledImages }: UseCanvasCleanupProps) => {
    useEffect(() => {
        requestAnimationFrame(() => {
            setDrawings([]);
            setFilledImages([]);
        });
    }, [splitMode, setDrawings, setFilledImages]);
};