export const drawBurstShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor?: string, imageElement?: HTMLImageElement, _borderType?: string | undefined, _borderSize?: number | undefined, _borderColor?: string | undefined) => {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) * 0.4;

    if (imageElement && imageElement.complete) {
        ctx.save();
        // Clip to burst shape (approximated as circle for simplicity)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(imageElement, x, y, width, height);
        ctx.restore();

        // Draw rays
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 4;
        const rayLength = radius * 0.9;
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            ctx.beginPath();
            ctx.moveTo(centerX + Math.cos(angle) * radius * 0.1, centerY + Math.sin(angle) * radius * 0.1);
            ctx.lineTo(centerX + Math.cos(angle) * rayLength, centerY + Math.sin(angle) * rayLength);
            ctx.stroke();
        }

        // Center circle outline
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.2, 0, 2 * Math.PI);
        ctx.stroke();
    } else {
        // Burst rays
        ctx.strokeStyle = fillColor || "#FFD700";
        ctx.lineWidth = 4;
        const rayLength = radius * 0.9;
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            ctx.beginPath();
            ctx.moveTo(centerX + Math.cos(angle) * radius * 0.1, centerY + Math.sin(angle) * radius * 0.1);
            ctx.lineTo(centerX + Math.cos(angle) * rayLength, centerY + Math.sin(angle) * rayLength);
            ctx.stroke();
        }

        // Center circle
        ctx.fillStyle = fillColor || "#FFD700";
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
};
