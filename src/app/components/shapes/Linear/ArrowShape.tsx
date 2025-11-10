export const drawArrowShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor: string, _imageElement?: HTMLImageElement, _borderType?: 'solid' | 'dashed' | 'dotted', _borderSize?: number, _borderColor?: string) => {
    ctx.save();

    // Set fill color
    ctx.fillStyle = fillColor || "#000000";

    // Scale factors for the SVG coordinates to fit the shape dimensions
    const scaleX = width / 100;
    const scaleY = height / 100;

    // Arrow shaft: x1=10, y1=50, x2=80, y2=50
    ctx.beginPath();
    ctx.moveTo(x + 10 * scaleX, y + 50 * scaleY);
    ctx.lineTo(x + 80 * scaleX, y + 50 * scaleY);
    ctx.strokeStyle = fillColor || "#000000";
    ctx.lineWidth = 4 * Math.min(scaleX, scaleY);
    ctx.stroke();

    // Arrowhead: points="80,50 70,40 70,60"
    ctx.beginPath();
    ctx.moveTo(x + 80 * scaleX, y + 50 * scaleY);
    ctx.lineTo(x + 70 * scaleX, y + 40 * scaleY);
    ctx.lineTo(x + 70 * scaleX, y + 60 * scaleY);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
};
