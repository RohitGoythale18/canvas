export const drawCubeShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor?: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    const size = Math.min(width, height);
    const depth = size * 0.3; // Depth for 3D effect
    const frontWidth = size * 0.7;

    if (imageElement && imageElement.complete) {
        ctx.save();
        // Define the cube shape path for clipping
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + frontWidth, y);
        ctx.lineTo(x + frontWidth + depth * 0.5, y - depth * 0.5);
        ctx.lineTo(x + frontWidth + depth * 0.5, y + size - depth * 0.5);
        ctx.lineTo(x + frontWidth, y + size);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x + depth * 0.5, y + size - depth * 0.5);
        ctx.lineTo(x + depth * 0.5, y - depth * 0.5);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(imageElement, x, y, width, height);
        ctx.restore();
        // Apply border styles
        ctx.strokeStyle = borderColor || "#000";
        ctx.lineWidth = borderSize || 2;
        if (borderType === 'dashed') {
            ctx.setLineDash([5, 5]);
        } else if (borderType === 'dotted') {
            ctx.setLineDash([2, 2]);
        } else {
            ctx.setLineDash([]);
        }
        ctx.strokeRect(x, y, frontWidth, size);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + depth * 0.5, y - depth * 0.5);
        ctx.moveTo(x + frontWidth, y);
        ctx.lineTo(x + frontWidth + depth * 0.5, y - depth * 0.5);
        ctx.moveTo(x + frontWidth, y + size);
        ctx.lineTo(x + frontWidth + depth * 0.5, y + size - depth * 0.5);
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash
    } else {
        // Front face
        ctx.fillStyle = fillColor || "#8B4513";
        ctx.fillRect(x, y, frontWidth, size);

        // Top face
        ctx.fillStyle = "#A0522D";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + depth * 0.5, y - depth * 0.5);
        ctx.lineTo(x + frontWidth + depth * 0.5, y - depth * 0.5);
        ctx.lineTo(x + frontWidth, y);
        ctx.closePath();
        ctx.fill();

        // Side face
        ctx.fillStyle = "#654321";
        ctx.beginPath();
        ctx.moveTo(x + frontWidth, y);
        ctx.lineTo(x + frontWidth + depth * 0.5, y - depth * 0.5);
        ctx.lineTo(x + frontWidth + depth * 0.5, y + size - depth * 0.5);
        ctx.lineTo(x + frontWidth, y + size);
        ctx.closePath();
        ctx.fill();

        // Outline
        // Apply border styles
        ctx.strokeStyle = borderColor || "#000";
        ctx.lineWidth = borderSize || 2;
        if (borderType === 'dashed') {
            ctx.setLineDash([5, 5]);
        } else if (borderType === 'dotted') {
            ctx.setLineDash([2, 2]);
        } else {
            ctx.setLineDash([]);
        }
        ctx.strokeRect(x, y, frontWidth, size);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + depth * 0.5, y - depth * 0.5);
        ctx.moveTo(x + frontWidth, y);
        ctx.lineTo(x + frontWidth + depth * 0.5, y - depth * 0.5);
        ctx.moveTo(x + frontWidth, y + size);
        ctx.lineTo(x + frontWidth + depth * 0.5, y + size - depth * 0.5);
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash
    }
};
