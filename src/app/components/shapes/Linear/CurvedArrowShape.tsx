export const drawCurvedArrowShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    ctx.save();

    // Set fill color
    ctx.fillStyle = fillColor || "#000000";

    // Scale factors for the SVG coordinates to fit the shape dimensions
    const scaleX = width / 100;
    const scaleY = height / 100;

    // Curved path: M10 80 Q50 20 90 80
    ctx.beginPath();
    ctx.moveTo(x + 10 * scaleX, y + 80 * scaleY);
    ctx.quadraticCurveTo(x + 50 * scaleX, y + 20 * scaleY, x + 90 * scaleX, y + 80 * scaleY);
    ctx.strokeStyle = fillColor || "#000000";
    ctx.lineWidth = 4 * Math.min(scaleX, scaleY);
    ctx.stroke();

    // Arrowhead: points="90,80 80,70 80,90"
    ctx.beginPath();
    ctx.moveTo(x + 90 * scaleX, y + 80 * scaleY);
    ctx.lineTo(x + 80 * scaleX, y + 70 * scaleY);
    ctx.lineTo(x + 80 * scaleX, y + 90 * scaleY);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
};
