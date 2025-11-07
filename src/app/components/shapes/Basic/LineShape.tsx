export const drawLineShape = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor?: string,
    imageElement?: HTMLImageElement,
    borderType?: 'solid' | 'dashed' | 'dotted',
    borderSize?: number,
    borderColor?: string
) => {
    ctx.strokeStyle = borderColor || "#000";
    ctx.lineWidth = borderSize || 4;
    ctx.setLineDash(borderType === 'dashed' ? [10, 5] : borderType === 'dotted' ? [2, 2] : []);
    ctx.beginPath();
    ctx.moveTo(x, y + height / 2);
    ctx.lineTo(x + width, y + height / 2);
    ctx.stroke();
    ctx.setLineDash([]); // Reset
};
