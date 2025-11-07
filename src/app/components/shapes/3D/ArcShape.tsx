export const drawArcShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 2;
    ctx.strokeStyle = borderColor || "#FF6B35";
    ctx.lineWidth = borderSize || 8;
    ctx.setLineDash(borderType === 'dashed' ? [10, 5] : borderType === 'dotted' ? [2, 2] : []);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI);
    ctx.stroke();
    ctx.setLineDash([]); // Reset
};
