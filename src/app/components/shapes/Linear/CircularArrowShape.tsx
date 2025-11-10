export const drawCircularArrowShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    ctx.save();

    // Set fill color
    ctx.fillStyle = fillColor || "#000000";

    // Scale factors for the SVG coordinates to fit the shape dimensions
    const scaleX = width / 100;
    const scaleY = height / 100;

    // Circular path: cx=50, cy=50, r=30
    ctx.beginPath();
    ctx.arc(x + 50 * scaleX, y + 50 * scaleY, 30 * Math.min(scaleX, scaleY), 0, 2 * Math.PI);
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

    // Arrowhead: points="80,50 70,45 70,55"
    ctx.beginPath();
    ctx.moveTo(x + 80 * scaleX, y + 50 * scaleY);
    ctx.lineTo(x + 70 * scaleX, y + 45 * scaleY);
    ctx.lineTo(x + 70 * scaleX, y + 55 * scaleY);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
};
