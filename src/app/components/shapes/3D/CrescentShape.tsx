export const drawCrescentShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor?: string, imageElement?: HTMLImageElement) => {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const outerRadius = Math.min(width, height) / 2;
    const innerRadius = outerRadius * 0.875;
    const innerOffset = outerRadius * 0.3;

    if (imageElement && imageElement.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
        ctx.arc(centerX + innerOffset, centerY, innerRadius, 0, 2 * Math.PI, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(imageElement, x, y, width, height);
        ctx.restore();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();
    } else {
        ctx.fillStyle = fillColor || "#FFD700";
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(centerX + innerOffset, centerY, innerRadius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
};
