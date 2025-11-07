export const drawHeartShape = (
ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor?: string, imageElement?: HTMLImageElement, borderType?: string | undefined, borderSize?: number | undefined, borderColor?: string | undefined) => {
    if (imageElement && imageElement.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y + height * 0.85);
        ctx.bezierCurveTo(x + width / 2, y + height * 0.75, x + width * 0.6, y + height * 0.6, x + width * 0.8, y + height * 0.6);
        ctx.bezierCurveTo(x + width * 0.85, y + height * 0.65, x + width * 0.85, y + height * 0.75, x + width * 0.75, y + height * 0.9);
        ctx.bezierCurveTo(x + width * 0.65, y + height * 0.95, x + width / 2, y + height, x + width / 2, y + height);
        ctx.bezierCurveTo(x + width / 2, y + height, x + width * 0.35, y + height * 0.95, x + width * 0.25, y + height * 0.9);
        ctx.bezierCurveTo(x + width * 0.15, y + height * 0.75, x + width * 0.15, y + height * 0.65, x + width * 0.2, y + height * 0.6);
        ctx.bezierCurveTo(x + width * 0.4, y + height * 0.6, x + width / 2, y + height * 0.75, x + width / 2, y + height * 0.85);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(imageElement, x, y, width, height);
        ctx.restore();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();
    } else {
        ctx.fillStyle = fillColor || "#FF0000";
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y + height * 0.85);
        ctx.bezierCurveTo(x + width / 2, y + height * 0.75, x + width * 0.6, y + height * 0.6, x + width * 0.8, y + height * 0.6);
        ctx.bezierCurveTo(x + width * 0.85, y + height * 0.65, x + width * 0.85, y + height * 0.75, x + width * 0.75, y + height * 0.9);
        ctx.bezierCurveTo(x + width * 0.65, y + height * 0.95, x + width / 2, y + height, x + width / 2, y + height);
        ctx.bezierCurveTo(x + width / 2, y + height, x + width * 0.35, y + height * 0.95, x + width * 0.25, y + height * 0.9);
        ctx.bezierCurveTo(x + width * 0.15, y + height * 0.75, x + width * 0.15, y + height * 0.65, x + width * 0.2, y + height * 0.6);
        ctx.bezierCurveTo(x + width * 0.4, y + height * 0.6, x + width / 2, y + height * 0.75, x + width / 2, y + height * 0.85);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
};
