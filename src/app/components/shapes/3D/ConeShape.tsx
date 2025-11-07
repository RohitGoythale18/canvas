export const drawConeShape = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor?: string,
    imageElement?: HTMLImageElement
) => {
    if (imageElement && imageElement.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(imageElement, x, y, width, height);
        ctx.restore();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();
    } else {
        ctx.fillStyle = fillColor || "#8B4513";
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
};
