export const drawDatabaseShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    ctx.save();

    // Set fill color
    ctx.fillStyle = fillColor || "#FFFFFF";

    // Scale factors for the SVG coordinates to fit the shape dimensions
    const scaleX = width / 100;
    const scaleY = height / 60;

    // Ellipse 1: cx=50, cy=20, rx=40, ry=15
    ctx.beginPath();
    ctx.ellipse(x + 50 * scaleX, y + 20 * scaleY, 40 * scaleX, 15 * scaleY, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Ellipse 2: cx=50, cy=40, rx=40, ry=15
    ctx.beginPath();
    ctx.ellipse(x + 50 * scaleX, y + 40 * scaleY, 40 * scaleX, 15 * scaleY, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Line: x1=10, y1=20, x2=90, y2=20
    ctx.beginPath();
    ctx.moveTo(x + 10 * scaleX, y + 20 * scaleY);
    ctx.lineTo(x + 90 * scaleX, y + 20 * scaleY);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2 * Math.min(scaleX, scaleY);
    ctx.stroke();

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
        // Stroke the ellipses again for border
        ctx.beginPath();
        ctx.ellipse(x + 50 * scaleX, y + 20 * scaleY, 40 * scaleX, 15 * scaleY, 0, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(x + 50 * scaleX, y + 40 * scaleY, 40 * scaleX, 15 * scaleY, 0, 0, 2 * Math.PI);
        ctx.stroke();
    }

    ctx.restore();
};
