'use client';
import { useCallback } from 'react';
import { CanvasData, Shape, UseLoadCanvasProps } from '@/types';
import { base64ToImageData } from '@/utils/imageUtils';

export const useLoadCanvas = ({ setShapes, setDrawings, setFilledImages, setCanvasBackground, setSplitMode, setUploadedImageUrl, setLoadedImage, yShapes, yDrawings, yConfig }: UseLoadCanvasProps) => {
    const loadCanvas = useCallback(async (canvasData: CanvasData) => {
        const shapesWithImages = await Promise.all(
            (canvasData.shapes || []).map(async (s: Shape) => {
                if (s.imageBase64 || s.imageUrl) {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.src = (s.imageBase64 || s.imageUrl) as string;
                    await img.decode();
                    return { ...s, imageElement: img };
                }
                return s;
            })
        );

        const filledImages = await Promise.all(
            (canvasData.filledImages || []).map(async fi => ({
                panelId: fi.panelId,
                imageData: await base64ToImageData(fi.imageData),
            }))
        );

        let uploadedImg: HTMLImageElement | null = null;
        if (canvasData.uploadedImageBase64) {
            uploadedImg = new Image();
            uploadedImg.crossOrigin = "anonymous";
            uploadedImg.src = canvasData.uploadedImageBase64;
            await uploadedImg.decode();
        }

        // Push to Yjs
        if (yShapes) {
            yShapes.clear();
            shapesWithImages.forEach(s => {
                const { imageElement: _, ...rest } = s as any;
                yShapes.set(s.id, rest);
            });
        }

        if (yDrawings) {
            yDrawings.clear();
            (canvasData.drawings || []).forEach(d => {
                yDrawings.set(d.panelId, d.paths);
            });
        }

        if (yConfig) {
            yConfig.set('splitMode', canvasData.splitMode || 'none');
            yConfig.set('backgroundColor', canvasData.backgroundColor || { default: '#fff' });
        }

        setShapes(shapesWithImages);
        setDrawings(canvasData.drawings || []);
        setFilledImages(filledImages);
        setCanvasBackground(canvasData.backgroundColor || { default: '#fff' });
        setSplitMode(canvasData.splitMode || 'none');
        setUploadedImageUrl(canvasData.uploadedImageBase64 || null);
        setLoadedImage(uploadedImg);
    }, [setShapes, setDrawings, setFilledImages, setCanvasBackground, setSplitMode, setUploadedImageUrl, setLoadedImage, yShapes, yDrawings, yConfig]);

    return { loadCanvas };
};
