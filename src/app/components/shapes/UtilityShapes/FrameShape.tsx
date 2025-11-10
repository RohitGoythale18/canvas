export const drawFrameShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    ctx.save();

    // Scale factors for the SVG coordinates to fit the shape dimensions
    const scaleX = width / 100;
    const scaleY = height / 60;

    // Outer frame: x=0, y=0, width=100, height=60, fill=none, stroke=#000, stroke-width=3
    ctx.strokeStyle = borderColor || "#000000";
    ctx.lineWidth = borderSize || 3;
    if (borderType === 'dashed') {
        ctx.setLineDash([5, 5]);
    } else if (borderType === 'dotted') {
        ctx.setLineDash([2, 2]);
    } else {
        ctx.setLineDash([]);
    }
    ctx.strokeRect(x + 0 * scaleX, y + 0 * scaleY, 100 * scaleX, 60 * scaleY);

    // Inner frame: x=10, y=10, width=80, height=40, fill=none, stroke=#000, stroke-width=1
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 10 * scaleX, y + 10 * scaleY, 80 * scaleX, 40 * scaleY);

    ctx.restore();
};
