export const drawDelayShape = (
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

  // Based on your original SVG-like coordinates:
  // rectangle top-left at (10,20), rect width 60, rect height 40
  const rectX = x + 10 * scaleX;
  const rectY = y + 20 * scaleY;
  const rectW = 60 * scaleX;
  const rectH = 40 * scaleY;

  // semicircle center is at the right edge middle of the rectangle
  const centerX = rectX + rectW;
  const centerY = rectY + rectH / 2;
  const radius = rectH / 2; // semicircle radius

  // Draw the combined path: left/top edge -> to right-top -> semicircle -> right-bottom -> back to left-bottom
  ctx.beginPath();
  // start at left-top
  ctx.moveTo(rectX, rectY);
  // top edge to right-top (just to the centerX)
  ctx.lineTo(centerX, rectY);
  // semicircle from top to bottom (clockwise)
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, Math.PI / 2, false);
  // line from right-bottom back to left-bottom
  ctx.lineTo(rectX, rectY + rectH);
  // close path back to left-top
  ctx.closePath();

  // Fill
  ctx.fill();

  // Draw optional border along the same outline
  if (borderType && borderSize && borderColor) {
    ctx.save();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderSize;
    // choose dash pattern
    if (borderType === 'dashed') ctx.setLineDash([8, 6]);
    else if (borderType === 'dotted') ctx.setLineDash([borderSize, borderSize * 1.5]);
    else ctx.setLineDash([]);

    // make joins look smooth
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // stroke the same path: recreate the path (safer)
    ctx.beginPath();
    ctx.moveTo(rectX, rectY);
    ctx.lineTo(centerX, rectY);
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, Math.PI / 2, false);
    ctx.lineTo(rectX, rectY + rectH);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
};
