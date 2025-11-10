export const drawPreparationShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    ctx.save();

    // Set fill color
    ctx.fillStyle = fillColor || "#FFFFFF";

    // Scale factors for the SVG coordinates to fit the shape dimensions
    const scaleX = width / 100;
    const scaleY = height / 60;

    // Polygon: points="20,0 80,0 100,30 80,60 20,60 0,30"
    ctx.beginPath();
    ctx.moveTo(x + 20 * scaleX, y + 0 * scaleY);
    ctx.lineTo(x + 80 * scaleX, y + 0 * scaleY);
    ctx.lineTo(x + 100 * scaleX, y + 30 * scaleY);
    ctx.lineTo(x + 80 * scaleX, y + 60 * scaleY);
    ctx.lineTo(x + 20 * scaleX, y + 60 * scaleY);
    ctx.lineTo(x + 0 * scaleX, y + 30 * scaleY);
    ctx.closePath();
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
