export const drawSplitArrowShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    ctx.save();

    // Set fill color
    ctx.fillStyle = fillColor || "#000000";

    // Scale factors for the SVG coordinates to fit the shape dimensions
    const scaleX = width / 100;
    const scaleY = height / 100;

    // Main shaft: x1=10, y1=50, x2=50, y2=50
    ctx.beginPath();
    ctx.moveTo(x + 10 * scaleX, y + 50 * scaleY);
    ctx.lineTo(x + 50 * scaleX, y + 50 * scaleY);
    ctx.strokeStyle = fillColor || "#000000";
    ctx.lineWidth = 4 * Math.min(scaleX, scaleY);
    ctx.stroke();

    // Split line 1: x1=50, y1=50, x2=80, y2=30
    ctx.beginPath();
    ctx.moveTo(x + 50 * scaleX, y + 50 * scaleY);
    ctx.lineTo(x + 80 * scaleX, y + 30 * scaleY);
    ctx.stroke();

    // Split line 2: x1=50, y1=50, x2=80, y2=70
    ctx.beginPath();
    ctx.moveTo(x + 50 * scaleX, y + 50 * scaleY);
    ctx.lineTo(x + 80 * scaleX, y + 70 * scaleY);
    ctx.stroke();

    // Arrowhead 1: points="80,30 70,25 70,35"
    ctx.beginPath();
    ctx.moveTo(x + 80 * scaleX, y + 30 * scaleY);
    ctx.lineTo(x + 70 * scaleX, y + 25 * scaleY);
    ctx.lineTo(x + 70 * scaleX, y + 35 * scaleY);
    ctx.closePath();
    ctx.fill();

    // Arrowhead 2: points="80,70 70,65 70,75"
    ctx.beginPath();
    ctx.moveTo(x + 80 * scaleX, y + 70 * scaleY);
    ctx.lineTo(x + 70 * scaleX, y + 65 * scaleY);
    ctx.lineTo(x + 70 * scaleX, y + 75 * scaleY);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
};
