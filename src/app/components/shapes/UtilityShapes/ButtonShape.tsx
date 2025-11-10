export const drawButtonShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    ctx.save();

    // Set fill color
    ctx.fillStyle = fillColor || "#007bff";

    // Scale factors for the SVG coordinates to fit the shape dimensions
    const scaleX = width / 100;
    const scaleY = height / 40;

    // Button background: x=5, y=5, width=90, height=30, rx=5, ry=5
    ctx.beginPath();
    ctx.roundRect(x + 5 * scaleX, y + 5 * scaleY, 90 * scaleX, 30 * scaleY, 5 * Math.min(scaleX, scaleY));
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

    // Button text: x=50, y=25, text-anchor=middle, fill=#fff, font-size=12
    ctx.fillStyle = "#ffffff";
    ctx.font = `${12 * Math.min(scaleX, scaleY)}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Button", x + 50 * scaleX, y + 25 * scaleY);

    ctx.restore();
};
