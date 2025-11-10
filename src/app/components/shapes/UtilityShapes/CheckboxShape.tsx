export const drawCheckboxShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize?: number, borderColor?: string) => {
    ctx.save();

    // Set fill color
    ctx.fillStyle = fillColor || "#ffffff";

    // Scale factors for the SVG coordinates to fit the shape dimensions
    const scaleX = width / 30;
    const scaleY = height / 30;

    // Checkbox square: x=5, y=5, width=20, height=20
    ctx.beginPath();
    ctx.rect(x + 5 * scaleX, y + 5 * scaleY, 20 * scaleX, 20 * scaleY);
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

    // Checkmark: d="M8 15 L12 19 L22 9", stroke=#000, stroke-width=2, fill=none
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2 * Math.min(scaleX, scaleY);
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x + 8 * scaleX, y + 15 * scaleY);
    ctx.lineTo(x + 12 * scaleX, y + 19 * scaleY);
    ctx.lineTo(x + 22 * scaleX, y + 9 * scaleY);
    ctx.stroke();

    ctx.restore();
};
