export const drawBentArrowShape = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fillColor: string,
  imageElement?: HTMLImageElement,
  borderType?: "solid" | "dashed" | "dotted",
  borderSize?: number,
  borderColor?: string
) => {
  ctx.save();

  const fill = fillColor || "#000000";

  const scaleX = width / 100;
  const scaleY = height / 100;
  const s = Math.min(scaleX, scaleY);

  // ARC PARAMETERS
  const cx = x + 50 * scaleX;
  const cy = y + 55 * scaleY; // lowered so arrow can point down clearly
  const radius = 40 * s;
  const thickness = 18 * s; // thick band

  // --- Draw thick arc ---
  ctx.beginPath();
  ctx.strokeStyle = fill;
  ctx.lineWidth = thickness;
  ctx.lineCap = "round";
  ctx.arc(cx, cy, radius, Math.PI, 0, false);
  ctx.stroke();

  // ENDPOINT OF ARC (at angle 0)
  const endX = cx + radius;
  const endY = cy;

  // --- Draw downward-pointing arrowhead ---
  const arrowHeight = 22 * s;
  const arrowWidth = 26 * s;

  const tipX = endX;
  const tipY = endY + arrowHeight; // ↓ downward tip

  const leftX = endX - arrowWidth / 2;
  const leftY = endY;

  const rightX = endX + arrowWidth / 2;
  const rightY = endY;

  ctx.beginPath();
  ctx.fillStyle = fill;
  ctx.moveTo(tipX, tipY);   // ↓ tip
  ctx.lineTo(leftX, leftY); // left base
  ctx.lineTo(rightX, rightY); // right base
  ctx.closePath();
  ctx.fill();

  // ---- OPTIONAL BORDER ----
  if (borderType && borderSize && borderColor) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderSize;

    if (borderType === "dashed") ctx.setLineDash([6 * s, 4 * s]);
    else if (borderType === "dotted") ctx.setLineDash([2 * s, 3 * s]);
    else ctx.setLineDash([]);

    // arc outline
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, 0, false);
    ctx.stroke();

    // arrow outline
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();
    ctx.stroke();
  }

  ctx.restore();
};
