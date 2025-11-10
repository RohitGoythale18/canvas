export const drawRadioButtonShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    ctx.save();

    // Scale factors for the SVG coordinates to fit the shape dimensions
    const scaleX = width / 30;
    const scaleY = height / 30;

    // Outer circle: cx=15, cy=15, r=10, fill=#fff, stroke=#000, stroke-width=2
    ctx.fillStyle = fillColor || "#ffffff";
    ctx.beginPath();
    ctx.arc(x + 15 * scaleX, y + 15 * scaleY, 10 * Math.min(scaleX, scaleY), 0, 2 * Math.PI);
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

    // Inner dot: cx=15, cy=15, r=5, fill=#000
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(x + 15 * scaleX, y + 15 * scaleY, 5 * Math.min(scaleX, scaleY), 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
};
