export const drawPyramidShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor?: string, imageElement?: HTMLImageElement, borderType?: 'solid' | 'dashed' | 'dotted', borderSize: number = 1, borderColor: string = '#000') => {
    const apexX = x + width / 2;
    const apexY = y;
    const baseY = y + height * 0.8;
    const baseWidth = width * 0.8;
    const baseOffset = (width - baseWidth) / 2;
    const depth = width * 0.2;

    const getLineDash = (type?: 'solid' | 'dashed' | 'dotted') => {
        if (type === 'dashed') return [10, 5];
        if (type === 'dotted') return [2, 6];
        return [];
    };

    const drawPolygon = (points: [number, number][], fill: string) => {
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();

        if (borderType) {
            ctx.save();
            ctx.lineWidth = borderSize;
            ctx.strokeStyle = borderColor;
            ctx.setLineDash(getLineDash(borderType));
            ctx.stroke();
            ctx.restore();
        }
    };

    // Base
    drawPolygon(
        [
            [x + baseOffset, baseY],
            [x + baseOffset + baseWidth, baseY],
            [x + baseOffset + baseWidth - depth, baseY + depth],
            [x + baseOffset - depth, baseY + depth],
        ],
        fillColor ?? "#FF7043"
    );

    // Front face
    drawPolygon(
        [
            [x, baseY],
            [apexX, apexY],
            [x + width, baseY],
        ],
        fillColor ?? "#F4511E"
    );

    // Side face
    drawPolygon(
        [
            [x + width, baseY],
            [apexX, apexY],
            [x + width - depth, baseY + depth],
            [x + width, baseY + depth],
        ],
        fillColor ?? "#D84315"
    );
};
