import { useEffect, useState, RefObject } from 'react';

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

export const useCanvasResize = (wrapperRef: RefObject<HTMLDivElement | null>) => {
    const [zoomLevel, setZoomLevel] = useState(1);

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
    }, [wrapperRef]);

    return { zoomLevel };
};