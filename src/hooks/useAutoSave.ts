'use client';
import { useEffect, useRef, useCallback } from 'react';
import { CanvasData, Shape } from '@/types';

interface UseAutoSaveProps {
    designId: string | null;
    token: string | null;
    canvasData: CanvasData;
    getCurrentCanvasImage: () => string;
    permission: string;
    interval?: number; // default 10s
}

export const useAutoSave = ({
    designId,
    token,
    canvasData,
    getCurrentCanvasImage,
    permission,
    interval = 2000,
}: UseAutoSaveProps) => {
    const lastSavedDataRef = useRef<string>('');
    const isSavingRef = useRef(false);

    const getCleanedShapes = (shapes: Shape[]) => {
        return shapes.map(({ imageElement: _img, ...rest }: any) => ({
            ...rest,
            fontSize: rest.fontSize ?? 16,
            fontFamily: rest.fontFamily ?? "Arial, sans-serif",
            textColor: rest.textColor ?? "#000000",
            fontStyles: rest.fontStyles ?? { bold: false, italic: false, underline: false, strikethrough: false },
            textAlignment: rest.textAlignment ?? "left",
            listType: rest.listType ?? "none",
        }));
    };

    const save = useCallback(async () => {
        if (!designId || !token || (permission !== 'OWNER' && permission !== 'WRITE') || isSavingRef.current) return;

        // Change detection: Check shapes, drawings, background, and splitMode
        const currentDataString = JSON.stringify({
            s: canvasData.shapes,
            d: canvasData.drawings,
            b: canvasData.backgroundColor,
            m: canvasData.splitMode
        });
        if (currentDataString === lastSavedDataRef.current) return;

        isSavingRef.current = true;
        try {
            const canvasImage = getCurrentCanvasImage();
            const cleanedShapes = getCleanedShapes(canvasData.shapes as Shape[]);

            const res = await fetch(`/api/designs/${designId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    data: { ...canvasData, shapes: cleanedShapes },
                    thumbnailUrl: canvasImage,
                }),
            });

            if (res.ok) {
                lastSavedDataRef.current = currentDataString;
                console.log('Auto-saved successfully');
            }
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            isSavingRef.current = false;
        }
    }, [designId, token, canvasData, getCurrentCanvasImage, permission]);

    useEffect(() => {
        const timer = setInterval(() => {
            save();
        }, interval);

        return () => clearInterval(timer);
    }, [save, interval]);

    return { save };
};
