'use client';
import { UseNewCanvasProps } from "@/types";

export const useNewCanvas = ({ setSplitMode, setCanvasBackground, setSelectedPanel, setShapes, setDrawings, setFilledImages, setUploadedImageUrl, setLoadedImage, setPermission, setResetKey, }: UseNewCanvasProps) => {

    const newCanvas = () => {
        setSplitMode('none');
        setCanvasBackground({ default: '#ffffff' });
        setSelectedPanel('default');
        setShapes([]);
        setDrawings([]);
        setFilledImages([]);
        setUploadedImageUrl(null);
        setLoadedImage(null);
        setPermission('OWNER');
        setResetKey(prev => prev + 1);
    };

    return { newCanvas };
};
