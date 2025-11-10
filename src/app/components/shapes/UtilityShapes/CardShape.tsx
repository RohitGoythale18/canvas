export const drawCardShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    ctx.save();

    // Set fill color
    ctx.fillStyle = fillColor || "#ffffff";

    // Scale factors for the SVG coordinates to fit the shape dimensions
    const scaleX = width / 100;
    const scaleY = height / 60;

    // Card background: x=5, y=5, width=90, height=50, rx=5, ry=5
    ctx.beginPath();
    ctx.roundRect(x + 5 * scaleX, y + 5 * scaleY, 90 * scaleX, 50 * scaleY, 5 * Math.min(scaleX, scaleY));
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

    // Card title: x=50, y=20, text-anchor=middle, fill=#333, font-size=10, font-weight=bold
    ctx.fillStyle = "#333333";
    ctx.font = `bold ${10 * Math.min(scaleX, scaleY)}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Card Title", x + 50 * scaleX, y + 20 * scaleY);

    // Card content: x=50, y=35, text-anchor=middle, fill=#666, font-size=8
    ctx.fillStyle = "#666666";
    ctx.font = `${8 * Math.min(scaleX, scaleY)}px Arial, sans-serif`;
    ctx.fillText("Card content", x + 50 * scaleX, y + 35 * scaleY);

    ctx.restore();
};
