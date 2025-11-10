export const drawCloudShape = (
ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor?: string, imageElement?: HTMLImageElement, _borderType?: string | undefined, _borderSize?: number | undefined, _borderColor?: string | undefined) => {
    if (imageElement && imageElement.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + width * 0.25, y + height * 0.6);
        ctx.quadraticCurveTo(x + width * 0.25, y + height * 0.5, x + width * 0.35, y + height * 0.5);
        ctx.quadraticCurveTo(x + width * 0.4, y + height * 0.4, x + width * 0.5, y + height * 0.4);
        ctx.quadraticCurveTo(x + width * 0.6, y + height * 0.4, x + width * 0.65, y + height * 0.5);
        ctx.quadraticCurveTo(x + width * 0.75, y + height * 0.5, x + width * 0.75, y + height * 0.6);
        ctx.quadraticCurveTo(x + width * 0.75, y + height * 0.7, x + width * 0.65, y + height * 0.7);
        ctx.lineTo(x + width * 0.35, y + height * 0.7);
        ctx.quadraticCurveTo(x + width * 0.25, y + height * 0.7, x + width * 0.25, y + height * 0.6);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(imageElement, x, y, width, height);
        ctx.restore();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();
    } else {
        ctx.fillStyle = fillColor || "#87CEEB";
        ctx.beginPath();
        ctx.moveTo(x + width * 0.25, y + height * 0.6);
        ctx.quadraticCurveTo(x + width * 0.25, y + height * 0.5, x + width * 0.35, y + height * 0.5);
        ctx.quadraticCurveTo(x + width * 0.4, y + height * 0.4, x + width * 0.5, y + height * 0.4);
        ctx.quadraticCurveTo(x + width * 0.6, y + height * 0.4, x + width * 0.65, y + height * 0.5);
        ctx.quadraticCurveTo(x + width * 0.75, y + height * 0.5, x + width * 0.75, y + height * 0.6);
        ctx.quadraticCurveTo(x + width * 0.75, y + height * 0.7, x + width * 0.65, y + height * 0.7);
        ctx.lineTo(x + width * 0.35, y + height * 0.7);
        ctx.quadraticCurveTo(x + width * 0.25, y + height * 0.7, x + width * 0.25, y + height * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
};
