export const drawDoubleArrowShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    ctx.save();

    // Set fill color
    ctx.fillStyle = fillColor || "#000000";

    // Scale factors for the SVG coordinates to fit the shape dimensions
    const scaleX = width / 100;
    const scaleY = height / 100;

    // Arrow shaft: x1=10, y1=50, x2=90, y2=50
    ctx.beginPath();
    ctx.moveTo(x + 10 * scaleX, y + 50 * scaleY);
    ctx.lineTo(x + 90 * scaleX, y + 50 * scaleY);
    ctx.strokeStyle = fillColor || "#000000";
    ctx.lineWidth = 4 * Math.min(scaleX, scaleY);
    ctx.stroke();

    // Left arrowhead: points="10,50 20,40 20,60"
    ctx.beginPath();
    ctx.moveTo(x + 10 * scaleX, y + 50 * scaleY);
    ctx.lineTo(x + 20 * scaleX, y + 40 * scaleY);
    ctx.lineTo(x + 20 * scaleX, y + 60 * scaleY);
    ctx.closePath();
    ctx.fill();

    // Right arrowhead: points="90,50 80,40 80,60"
    ctx.beginPath();
    ctx.moveTo(x + 90 * scaleX, y + 50 * scaleY);
    ctx.lineTo(x + 80 * scaleX, y + 40 * scaleY);
    ctx.lineTo(x + 80 * scaleX, y + 60 * scaleY);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
};
