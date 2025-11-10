export const drawDividerShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    ctx.save();

    // Scale factors for the SVG coordinates to fit the shape dimensions
    const scaleX = width / 100;
    const scaleY = height / 10;

    // Divider line: x1=0, y1=5, x2=100, y2=5, stroke=#ccc, stroke-width=2
    ctx.strokeStyle = borderColor || "#cccccc";
    ctx.lineWidth = borderSize || 2;
    if (borderType === 'dashed') {
        ctx.setLineDash([5, 5]);
    } else if (borderType === 'dotted') {
        ctx.setLineDash([2, 2]);
    } else {
        ctx.setLineDash([]);
    }
    ctx.beginPath();
    ctx.moveTo(x + 0 * scaleX, y + 5 * scaleY);
    ctx.lineTo(x + 100 * scaleX, y + 5 * scaleY);
    ctx.stroke();

    ctx.restore();
};
