export const drawDashedConnectorShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor: string, _imageElement?: HTMLImageElement, _borderType?: 'solid' | 'dashed' | 'dotted', _borderSize?: number, _borderColor?: string) => {
    ctx.save();

    // Set stroke color
    ctx.strokeStyle = fillColor || "#000000";

    // Scale factors for the SVG coordinates to fit the shape dimensions
    const scaleX = width / 100;
    const scaleY = height / 100;

    // Dashed line: x1=10, y1=50, x2=90, y2=50
    ctx.beginPath();
    ctx.moveTo(x + 10 * scaleX, y + 50 * scaleY);
    ctx.lineTo(x + 90 * scaleX, y + 50 * scaleY);
    ctx.lineWidth = 4 * Math.min(scaleX, scaleY);
    ctx.setLineDash([10 * Math.min(scaleX, scaleY), 5 * Math.min(scaleX, scaleY)]);
    ctx.stroke();

    ctx.restore();
};
