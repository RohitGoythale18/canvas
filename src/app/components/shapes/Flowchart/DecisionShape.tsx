export const drawDecisionShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    ctx.save();

    // Set fill color
    ctx.fillStyle = fillColor || "#FFFFFF";

    // Scale factors for the SVG coordinates to fit the shape dimensions
    const scaleX = width / 100;
    const scaleY = height / 100;

    // Polygon: points="50,0 100,50 50,100 0,50"
    ctx.beginPath();
    ctx.moveTo(x + 50 * scaleX, y + 0 * scaleY);
    ctx.lineTo(x + 100 * scaleX, y + 50 * scaleY);
    ctx.lineTo(x + 50 * scaleX, y + 100 * scaleY);
    ctx.lineTo(x + 0 * scaleX, y + 50 * scaleY);
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
