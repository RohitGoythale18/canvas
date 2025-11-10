export const drawTimelineNodeShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    ctx.save();

    // Scale factors for the SVG coordinates to fit the shape dimensions
    const scaleX = width / 100;
    const scaleY = height / 50;

    // Timeline line: x1=0, y1=25, x2=100, y2=25, stroke=#ccc, stroke-width=2
    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x + 0 * scaleX, y + 25 * scaleY);
    ctx.lineTo(x + 100 * scaleX, y + 25 * scaleY);
    ctx.stroke();

    // Node circle: cx=50, cy=25, r=10, fill=#007bff, stroke=#0056b3, stroke-width=2
    ctx.fillStyle = fillColor || "#007bff";
    ctx.beginPath();
    ctx.arc(x + 50 * scaleX, y + 25 * scaleY, 10 * Math.min(scaleX, scaleY), 0, 2 * Math.PI);
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

    // Node text: x=50, y=30, text-anchor=middle, fill=#fff, font-size=10
    ctx.fillStyle = "#ffffff";
    ctx.font = `${10 * Math.min(scaleX, scaleY)}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("1", x + 50 * scaleX, y + 30 * scaleY);

    ctx.restore();
};
