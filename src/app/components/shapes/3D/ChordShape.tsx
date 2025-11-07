export const drawChordShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor?: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 2;

    // configure stroke based on provided border options
    const lineWidth = borderSize ?? 2;
    const strokeCol = borderColor || "#000";
    const dash =
        borderType === 'dashed' ? [6, 4] :
        borderType === 'dotted' ? [1, 3] : [];

    if (imageElement && imageElement.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI);
        ctx.lineTo(centerX, centerY);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(imageElement, x, y, width, height);
        ctx.restore();
        // redraw the outline path for stroking since clipping/restoring can clear path
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI);
        ctx.lineTo(centerX, centerY);
        ctx.closePath();
        ctx.setLineDash(dash);
        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        ctx.setLineDash([]);
    } else {
        ctx.fillStyle = fillColor || "#F7931E";
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI);
        ctx.lineTo(centerX, centerY);
        ctx.closePath();
        ctx.fill();
        ctx.setLineDash(dash);
        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        ctx.setLineDash([]);
    }
};
