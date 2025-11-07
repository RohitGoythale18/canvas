export const drawSquareShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor?: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    const size = Math.min(width, height);

    if (imageElement && imageElement.complete) {
        ctx.drawImage(imageElement, x, y, size, size);
        if (borderType) {
            ctx.strokeStyle = borderColor || "#000";
            ctx.lineWidth = borderSize || 2;
            ctx.setLineDash(borderType === 'dashed' ? [10, 5] : borderType === 'dotted' ? [2, 2] : []);
            ctx.strokeRect(x, y, size, size);
            ctx.setLineDash([]); // Reset
        }
    } else {
        ctx.fillStyle = fillColor || "#2196F3";
        ctx.fillRect(x, y, size, size);
        if (borderType) {
            ctx.strokeStyle = borderColor || "#000";
            ctx.lineWidth = borderSize || 2;
            ctx.setLineDash(borderType === 'dashed' ? [10, 5] : borderType === 'dotted' ? [2, 2] : []);
            ctx.strokeRect(x, y, size, size);
            ctx.setLineDash([]); // Reset
        }
    }
};
