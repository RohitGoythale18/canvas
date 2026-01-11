'use client';

export const useSaveCanvas = () => {
    const saveCanvas = (): string => {
        const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;

        if (!canvas) return '';

        return canvas.toDataURL('image/png');
    };

    return { saveCanvas };
};
