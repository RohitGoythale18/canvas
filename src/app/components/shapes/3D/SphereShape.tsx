export const drawSphereShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor?: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 2;

    // Shadow
    ctx.fillStyle = "#BDBDBD";
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + radius * 0.7, radius, radius * 0.3, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Main sphere
    ctx.fillStyle = fillColor || "#2196F3";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();

    // Draw border if specified
    if (borderSize && borderColor) {
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

    // Highlight
    ctx.fillStyle = "#BBDEFB";
    ctx.beginPath();
    ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.4, 0, 2 * Math.PI);
    ctx.fill();
};
