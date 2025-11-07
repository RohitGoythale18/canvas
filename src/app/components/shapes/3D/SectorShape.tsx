export const drawSectorShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor?: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 2;

    ctx.fillStyle = fillColor || "#9C27B0";
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, -Math.PI / 4, Math.PI / 4);
    ctx.closePath();
    ctx.fill();

    if (borderType && borderSize && borderColor) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderSize;
        ctx.stroke();
    }
};
