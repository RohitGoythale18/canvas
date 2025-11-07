export const drawTrapezoidShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor?: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string): void => {
    const topWidth = width * 0.8;
    const topOffset = (width - topWidth) / 2;

    if (imageElement && imageElement.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + topOffset, y);
        ctx.lineTo(x + topOffset + topWidth, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(imageElement, x, y, width, height);
        ctx.restore();
        if (borderType) {
            ctx.strokeStyle = borderColor || "#000";
            ctx.lineWidth = borderSize || 2;
            ctx.setLineDash(borderType === 'dashed' ? [10, 5] : borderType === 'dotted' ? [2, 2] : []);
            ctx.stroke();
            ctx.setLineDash([]); // Reset
        }
    } else {
        ctx.fillStyle = fillColor || "#9E9E9E";
        ctx.beginPath();
        ctx.moveTo(x + topOffset, y);
        ctx.lineTo(x + topOffset + topWidth, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        ctx.fill();
        if (borderType) {
            ctx.strokeStyle = borderColor || "#000";
            ctx.lineWidth = borderSize || 2;
            ctx.setLineDash(borderType === 'dashed' ? [10, 5] : borderType === 'dotted' ? [2, 2] : []);
            ctx.stroke();
            ctx.setLineDash([]); // Reset
        }
    }
};
