export const drawTabShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    ctx.save();

    // Set fill color
    ctx.fillStyle = fillColor || "#f0f0f0";

    // Scale factors for the SVG coordinates to fit the shape dimensions
    const scaleX = width / 80;
    const scaleY = height / 40;

    // Tab shape using path: d="M10 30 Q10 10 30 10 L50 10 Q60 10 60 20 L60 30 Z"
    ctx.beginPath();
    ctx.moveTo(x + 10 * scaleX, y + 30 * scaleY);
    ctx.quadraticCurveTo(x + 10 * scaleX, y + 10 * scaleY, x + 30 * scaleX, y + 10 * scaleY);
    ctx.lineTo(x + 50 * scaleX, y + 10 * scaleY);
    ctx.quadraticCurveTo(x + 60 * scaleX, y + 10 * scaleY, x + 60 * scaleX, y + 20 * scaleY);
    ctx.lineTo(x + 60 * scaleX, y + 30 * scaleY);
    ctx.closePath();
    ctx.fill();

    // Draw border if specified
    if (borderType && borderSize && borderColor) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderSize;
        if (borderType === 'dashed') {
            ctx.setLineDash([5, 5]);
        } else if (borderType === 'dotted') {
            ctx.setLineDash([2, 2]);
        } else {
            ctx.setLineDash([]);
        }
        ctx.stroke();
    }

    // Tab text: x=40, y=25, text-anchor=middle, fill=#333, font-size=10
    ctx.fillStyle = "#333333";
    ctx.font = `${10 * Math.min(scaleX, scaleY)}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Tab", x + 40 * scaleX, y + 25 * scaleY);

    ctx.restore();
};
