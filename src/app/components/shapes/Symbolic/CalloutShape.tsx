export const drawCalloutShape = (
ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor?: string, imageElement?: HTMLImageElement, borderType?: string | undefined, borderSize?: number | undefined, borderColor?: string | undefined) => {
    if (imageElement && imageElement.complete) {
        ctx.save();
        // Clip to callout shape
        ctx.beginPath();
        ctx.moveTo(x + width * 0.2, y + height * 0.2);
        ctx.quadraticCurveTo(x + width * 0.2, y + height * 0.1, x + width * 0.3, y + height * 0.1);
        ctx.lineTo(x + width * 0.7, y + height * 0.1);
        ctx.quadraticCurveTo(x + width * 0.8, y + height * 0.1, x + width * 0.8, y + height * 0.2);
        ctx.lineTo(x + width * 0.8, y + height * 0.6);
        ctx.quadraticCurveTo(x + width * 0.8, y + height * 0.7, x + width * 0.7, y + height * 0.7);
        ctx.lineTo(x + width * 0.5, y + height * 0.7);
        ctx.lineTo(x + width * 0.4, y + height * 0.8);
        ctx.lineTo(x + width * 0.3, y + height * 0.7);
        ctx.lineTo(x + width * 0.3, y + height * 0.7);
        ctx.quadraticCurveTo(x + width * 0.2, y + height * 0.7, x + width * 0.2, y + height * 0.6);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(imageElement, x, y, width, height);
        ctx.restore();

        // Draw outline
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();
    } else {
        ctx.fillStyle = fillColor || "#FFF";
        ctx.beginPath();
        ctx.moveTo(x + width * 0.2, y + height * 0.2);
        ctx.quadraticCurveTo(x + width * 0.2, y + height * 0.1, x + width * 0.3, y + height * 0.1);
        ctx.lineTo(x + width * 0.7, y + height * 0.1);
        ctx.quadraticCurveTo(x + width * 0.8, y + height * 0.1, x + width * 0.8, y + height * 0.2);
        ctx.lineTo(x + width * 0.8, y + height * 0.6);
        ctx.quadraticCurveTo(x + width * 0.8, y + height * 0.7, x + width * 0.7, y + height * 0.7);
        ctx.lineTo(x + width * 0.5, y + height * 0.7);
        ctx.lineTo(x + width * 0.4, y + height * 0.8);
        ctx.lineTo(x + width * 0.3, y + height * 0.7);
        ctx.lineTo(x + width * 0.3, y + height * 0.7);
        ctx.quadraticCurveTo(x + width * 0.2, y + height * 0.7, x + width * 0.2, y + height * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
};
