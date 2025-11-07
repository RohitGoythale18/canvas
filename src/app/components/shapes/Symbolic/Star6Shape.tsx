export const drawStar6Shape = (
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
    const outerRadius = Math.min(width, height) * 0.45;
    const innerRadius = outerRadius * 0.5;

    if (imageElement && imageElement.complete) {
        ctx.save();
        // Clip to 6-pointed star shape
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const outerAngle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
            const innerAngle = ((i + 0.5) * 2 * Math.PI) / 6 - Math.PI / 2;

            if (i === 0) {
                ctx.moveTo(centerX + Math.cos(outerAngle) * outerRadius, centerY + Math.sin(outerAngle) * outerRadius);
            } else {
                ctx.lineTo(centerX + Math.cos(outerAngle) * outerRadius, centerY + Math.sin(outerAngle) * outerRadius);
            }
            ctx.lineTo(centerX + Math.cos(innerAngle) * innerRadius, centerY + Math.sin(innerAngle) * innerRadius);
        }
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(imageElement, x, y, width, height);
        ctx.restore();

        // Draw outline
        if (borderType) {
            ctx.strokeStyle = borderColor || "#000";
            ctx.lineWidth = borderSize || 2;
            ctx.setLineDash(borderType === 'dashed' ? [10, 5] : borderType === 'dotted' ? [2, 2] : []);
            ctx.stroke();
            ctx.setLineDash([]); // Reset
        }
    } else {
        ctx.fillStyle = fillColor || "#FFD700";
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const outerAngle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
            const innerAngle = ((i + 0.5) * 2 * Math.PI) / 6 - Math.PI / 2;

            if (i === 0) {
                ctx.moveTo(centerX + Math.cos(outerAngle) * outerRadius, centerY + Math.sin(outerAngle) * outerRadius);
            } else {
                ctx.lineTo(centerX + Math.cos(outerAngle) * outerRadius, centerY + Math.sin(outerAngle) * outerRadius);
            }
            ctx.lineTo(centerX + Math.cos(innerAngle) * innerRadius, centerY + Math.sin(innerAngle) * innerRadius);
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
