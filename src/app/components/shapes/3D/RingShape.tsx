export const drawRingShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor?: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const outerRadius = Math.min(width, height) / 2;
    const innerRadius = outerRadius * 0.4;

    ctx.fillStyle = fillColor || "#E91E63";
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI, true);
    ctx.fill();

    if (borderSize && borderColor) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderSize;
        if (borderType === 'dashed') {
            ctx.setLineDash([5, 5]);
        } else if (borderType === 'dotted') {
            ctx.setLineDash([2, 2]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }
};
