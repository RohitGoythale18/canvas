export const drawDelayShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    ctx.save();

    // Set fill color
    ctx.fillStyle = fillColor || "#FFFFFF";

    // Scale factors for the SVG coordinates to fit the shape dimensions
    const scaleX = width / 100;
    const scaleY = height / 60;

    // Rectangle: x=10, y=20, width=60, height=40
    ctx.beginPath();
    ctx.rect(x + 10 * scaleX, y + 20 * scaleY, 60 * scaleX, 40 * scaleY);
    ctx.fill();

    // Line 1: x1=70, y1=20, x2=80, y2=10
    ctx.beginPath();
    ctx.moveTo(x + 70 * scaleX, y + 20 * scaleY);
    ctx.lineTo(x + 80 * scaleX, y + 10 * scaleY);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2 * Math.min(scaleX, scaleY);
    ctx.stroke();

    // Line 2: x1=80, y1=10, x2=90, y2=20
    ctx.beginPath();
    ctx.moveTo(x + 80 * scaleX, y + 10 * scaleY);
    ctx.lineTo(x + 90 * scaleX, y + 20 * scaleY);
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
        ctx.strokeRect(x + 10 * scaleX, y + 20 * scaleY, 60 * scaleX, 40 * scaleY);
    }

    ctx.restore();
};
