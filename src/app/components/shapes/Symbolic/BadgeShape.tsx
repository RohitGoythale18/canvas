export const drawBadgeShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor?: string, imageElement?: HTMLImageElement, borderType?: string | undefined, borderSize?: number | undefined, borderColor?: string | undefined) => {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) * 0.4;

    if (imageElement && imageElement.complete) {
        ctx.save();
        // Clip to badge circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(imageElement, x, y, width, height);
        ctx.restore();

        // Draw ribbon
        ctx.fillStyle = "#FF0000";
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + radius);
        ctx.lineTo(centerX - radius * 0.75, centerY + radius * 0.25);
        ctx.lineTo(centerX + radius * 0.75, centerY + radius * 0.25);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Stroke the circle
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
    } else {
        // Badge circle
        ctx.fillStyle = fillColor || "#FFD700";
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Badge ribbon
        ctx.fillStyle = "#FF0000";
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + radius);
        ctx.lineTo(centerX - radius * 0.75, centerY + radius * 0.25);
        ctx.lineTo(centerX + radius * 0.75, centerY + radius * 0.25);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
};
