export const drawManualInputShape = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fillColor: string,
  imageElement?: HTMLImageElement,
  borderType?: 'solid' | 'dashed' | 'dotted',
  borderSize?: number,
  borderColor?: string
) => {
  ctx.save();

  // Fill color
  ctx.fillStyle = fillColor || "#FFFFFF";

  // Scale factors for the SVG coordinates to fit the shape dimensions
  const scaleX = width / 100;
  const scaleY = height / 60;

  // Choose points (a trapezoid with a slanted top)
  // top-left inset so top slopes up to the right:
  const p0x = x + 5 * scaleX;   // top-left x
  const p0y = y + 10 * scaleY;  // top-left y (a bit down)
  const p1x = x + 100 * scaleX; // top-right x
  const p1y = y + 0 * scaleY;   // top-right y (higher)
  const p2x = x + 100 * scaleX; // bottom-right x
  const p2y = y + 60 * scaleY;  // bottom-right y (bottom)
  const p3x = x + 0 * scaleX;   // bottom-left x
  const p3y = y + 60 * scaleY;  // bottom-left y

  // Draw path
  ctx.beginPath();
  ctx.moveTo(p0x, p0y);    // top-left
  ctx.lineTo(p1x, p1y);    // top-right
  ctx.lineTo(p2x, p2y);    // bottom-right
  ctx.lineTo(p3x, p3y);    // bottom-left
  ctx.closePath();

  // Fill
  ctx.fill();

  // Draw optional border along the same outline
  if (borderType && borderSize && borderColor) {
    ctx.save();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderSize;

    // dash patterns
    if (borderType === 'dashed') ctx.setLineDash([8, 6]);
    else if (borderType === 'dotted') ctx.setLineDash([borderSize, borderSize * 1.5]);
    else ctx.setLineDash([]);

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Stroke the same path
    ctx.beginPath();
    ctx.moveTo(p0x, p0y);
    ctx.lineTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.lineTo(p3x, p3y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
};
