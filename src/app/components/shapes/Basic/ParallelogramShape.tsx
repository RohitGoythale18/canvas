export const drawParallelogramShape = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor?: string,
    imageElement?: HTMLImageElement,
    borderType?: 'solid' | 'dashed' | 'dotted',
    borderSize?: number,
    borderColor?: string
) => {
    const skew = width * 0.2; // Skew amount

    if (imageElement && imageElement.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + skew, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width - skew, y + height);
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
        ctx.fillStyle = fillColor || "#FF5722";
        ctx.beginPath();
        ctx.moveTo(x + skew, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width - skew, y + height);
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
