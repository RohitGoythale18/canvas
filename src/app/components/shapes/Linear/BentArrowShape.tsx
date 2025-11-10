export const drawBentArrowShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    ctx.save();

    // Set fill color
    ctx.fillStyle = fillColor || "#000000";

    // Scale factors for the SVG coordinates to fit the shape dimensions
    const scaleX = width / 100;
    const scaleY = height / 100;

    // Bent arrow path: M10 50 L50 50 L50 20 L80 50 L50 80 L50 50
    ctx.beginPath();
    ctx.moveTo(x + 10 * scaleX, y + 50 * scaleY);
    ctx.lineTo(x + 50 * scaleX, y + 50 * scaleY);
    ctx.lineTo(x + 50 * scaleX, y + 20 * scaleY);
    ctx.lineTo(x + 80 * scaleX, y + 50 * scaleY);
    ctx.lineTo(x + 50 * scaleX, y + 80 * scaleY);
    ctx.lineTo(x + 50 * scaleX, y + 50 * scaleY);
    ctx.closePath();

    // Fill the shape
    ctx.fill();

    // Draw border if specified
    if (borderType && borderSize && borderColor) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderSize;
        if (borderType === 'dashed') {
            ctx.setLineDash([5, 5]);
        } else if (borderType === 'dotted') {
            ctx.setLineDash([2, 2]);
        } else {
            ctx.setLineDash([]);
        }
        ctx.stroke();
    }

    ctx.restore();
};
