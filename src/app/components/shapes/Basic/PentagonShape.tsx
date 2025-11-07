export const drawPentagonShape = (
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
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 2;

    if (imageElement && imageElement.complete) {
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const pointX = centerX + radius * Math.cos(angle);
            const pointY = centerY + radius * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(pointX, pointY);
            } else {
                ctx.lineTo(pointX, pointY);
            }
        }
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
        ctx.fillStyle = fillColor || "#795548";
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const pointX = centerX + radius * Math.cos(angle);
            const pointY = centerY + radius * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(pointX, pointY);
            } else {
                ctx.lineTo(pointX, pointY);
            }
        }
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
