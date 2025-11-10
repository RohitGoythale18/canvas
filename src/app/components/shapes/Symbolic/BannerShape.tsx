export const drawBannerShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor?: string, imageElement?: HTMLImageElement, _borderType?: string | undefined, _borderSize?: number | undefined, _borderColor?: string | undefined): void => {
    if (imageElement && imageElement.complete) {
        ctx.save();
        // Clip to banner shape
        ctx.beginPath();
        ctx.moveTo(x + width * 0.1, y + height * 0.3);
        ctx.lineTo(x, y + height * 0.2);
        ctx.lineTo(x + width * 0.1, y + height * 0.4);
        ctx.lineTo(x + width * 0.9, y + height * 0.4);
        ctx.lineTo(x + width, y + height * 0.2);
        ctx.lineTo(x + width * 0.9, y + height * 0.3);
        ctx.lineTo(x + width * 0.9, y + height * 0.7);
        ctx.lineTo(x + width * 0.1, y + height * 0.7);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(imageElement, x, y, width, height);
        ctx.restore();

        // Draw outline
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();
    } else {
        ctx.fillStyle = fillColor || "#FF0000";

        // Banner rectangle
        ctx.fillRect(x + width * 0.1, y + height * 0.3, width * 0.8, height * 0.4);

        // Banner tails
        ctx.beginPath();
        ctx.moveTo(x + width * 0.1, y + height * 0.3);
        ctx.lineTo(x, y + height * 0.2);
        ctx.lineTo(x + width * 0.1, y + height * 0.4);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x + width * 0.9, y + height * 0.3);
        ctx.lineTo(x + width, y + height * 0.2);
        ctx.lineTo(x + width * 0.9, y + height * 0.4);
        ctx.closePath();
        ctx.fill();

        // Outline
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.strokeRect(x + width * 0.1, y + height * 0.3, width * 0.8, height * 0.4);
        ctx.beginPath();
        ctx.moveTo(x + width * 0.1, y + height * 0.3);
        ctx.lineTo(x, y + height * 0.2);
        ctx.lineTo(x + width * 0.1, y + height * 0.4);
        ctx.moveTo(x + width * 0.9, y + height * 0.3);
        ctx.lineTo(x + width, y + height * 0.2);
        ctx.lineTo(x + width * 0.9, y + height * 0.4);
        ctx.stroke();
    }
};
