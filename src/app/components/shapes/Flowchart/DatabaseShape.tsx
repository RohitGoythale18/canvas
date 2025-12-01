export const drawDatabaseShape = (
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
  ctx.fillStyle = fillColor || '#FFFFFF';

  // Scale factors for the SVG coordinates to fit the shape dimensions
  const scaleX = width / 100;
  const scaleY = height / 60;

  // Ellipse parameters based on your original coordinates:
  const centerX = x + 50 * scaleX;
  const topCy = y + 20 * scaleY;    // top ellipse center (cy=20)
  const bottomCy = y + 40 * scaleY; // bottom ellipse center (cy=40)
  const rx = 40 * scaleX;           // rx = 40
  const ry = 15 * scaleY;           // ry = 15

  // -- Fill body: rectangle between top ellipse bottom and bottom ellipse top --
  // top ellipse bottom = topCy + ry
  // bottom ellipse top = bottomCy - ry
  const bodyY = topCy + ry;
  const bodyH = (bottomCy - ry) - bodyY;
  if (bodyH > 0) {
    ctx.fillRect(centerX - rx, bodyY, 2 * rx, bodyH);
  }

  // -- Fill bottom ellipse (so body appears rounded) --
  ctx.beginPath();
  ctx.ellipse(centerX, bottomCy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // -- Fill top ellipse (drawn last so it sits above the body) --
  ctx.beginPath();
  ctx.ellipse(centerX, topCy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // -- Draw the two thin groove lines near the top (thin ellipses) --
  // tweak groove vertical offsets & thickness as needed
  const grooveRy = Math.max(1, 3 * scaleY); // small vertical radius for grooves
  const groove1Cy = topCy + 6 * scaleY;
  const groove2Cy = topCy + 10 * scaleY;

  ctx.save();
  ctx.strokeStyle = '#276fa8'; // default groove color (you can change or reuse borderColor)
  ctx.lineWidth = 1 * Math.min(scaleX, scaleY);

  // groove 1
  ctx.beginPath();
  ctx.ellipse(centerX, groove1Cy, rx - 2 * scaleX, grooveRy, 0, Math.PI, 0); // draw front arc (left->right)
  ctx.stroke();

  // groove 2
  ctx.beginPath();
  ctx.ellipse(centerX, groove2Cy, rx - 2 * scaleX, grooveRy, 0, Math.PI, 0);
  ctx.stroke();
  ctx.restore();

  // -- Draw outline (top ellipse, side lines, bottom ellipse) if border options provided --
  if (borderType && borderSize && borderColor) {
    ctx.save();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderSize;
    if (borderType === 'dashed') ctx.setLineDash([8, 6]);
    else if (borderType === 'dotted') ctx.setLineDash([borderSize, borderSize * 1.5]);
    else ctx.setLineDash([]);

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // stroke top ellipse
    ctx.beginPath();
    ctx.ellipse(centerX, topCy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    // stroke side lines (connect top ellipse edge to bottom ellipse edge)
    ctx.beginPath();
    ctx.moveTo(centerX - rx, topCy);
    ctx.lineTo(centerX - rx, bottomCy);
    ctx.moveTo(centerX + rx, topCy);
    ctx.lineTo(centerX + rx, bottomCy);
    ctx.stroke();

    // stroke bottom ellipse
    ctx.beginPath();
    ctx.ellipse(centerX, bottomCy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  } else {
    // if no border options given, draw a subtle default outline to match your example
    ctx.save();
    ctx.strokeStyle = '#2a6aa9';
    ctx.lineWidth = 1 * Math.min(scaleX, scaleY);
    ctx.beginPath();
    ctx.ellipse(centerX, topCy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(centerX, bottomCy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
};
