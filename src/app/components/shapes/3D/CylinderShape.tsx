export const drawCylinderShape = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillColor: string | undefined, imageElement: HTMLImageElement | undefined, borderType: string | undefined, borderSize: number | undefined, borderColor: string | undefined) => {
    const centerX = x + width / 2;
    const topY = y + height * 0.2;
    const bottomY = y + height * 0.8;
    const radiusX = width / 2;
    const radiusY = height * 0.1;

    // Top ellipse
    ctx.fillStyle = "#7CB342";
    ctx.beginPath();
    ctx.ellipse(centerX, topY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Body rectangle
    ctx.fillRect(x, topY, width, height * 0.6);

    // Bottom ellipse
    ctx.fillStyle = "#558B2F";
    ctx.beginPath();
    ctx.ellipse(centerX, bottomY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.fill();
};
