export const drawConnectorShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    ctx.save();

    // Set fill color
    ctx.fillStyle = fillColor || "#FFFFFF";

    // Scale factors for the SVG coordinates to fit the shape dimensions
    const scaleX = width / 100;
    const scaleY = height / 100;

    // Circle: cx=50, cy=50, r=20
    ctx.beginPath();
    ctx.arc(x + 50 * scaleX, y + 50 * scaleY, 20 * Math.min(scaleX, scaleY), 0, 2 * Math.PI);
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
