import { useEffect, useRef } from 'react';
import * as Shapes from '../app/components/shapes/index';
import { DrawingPath, Shape, UseDrawingToolsProps } from '@/types';

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

export const useDrawingTools = ({
  pencilActive,
  eraserActive,
  eraserSize,
  splitMode,
  setDrawings,
  onSaveState,
  shapes,
  onShapesChange,
  permission,
}: UseDrawingToolsProps) => {
  const isDrawingRef = useRef(false);
  const currentPathRef = useRef<DrawingPath | null>(null);
  const currentPanelRef = useRef<string>('default');
  const canEdit = permission === 'OWNER' || permission === 'WRITE';

  useEffect(() => {
    /**
     * Rasterize touched shapes and apply eraser stroke onto their raster
     * so erasure persists even after moving shapes.
     */
    const processEraserPathOnShapes = async (path: DrawingPath) => {
      if (!path.points || path.points.length === 0) return;

      // compute bbox of the eraser path
      const minX = Math.min(...path.points.map((p) => p.x));
      const minY = Math.min(...path.points.map((p) => p.y));
      const maxX = Math.max(...path.points.map((p) => p.x));
      const maxY = Math.max(...path.points.map((p) => p.y));

      // shapes whose bbox intersects eraser bbox
      const touched = shapes.filter((s) => {
        const sMinX = s.x;
        const sMinY = s.y;
        const sMaxX = s.x + s.width;
        const sMaxY = s.y + s.height;
        return !(sMinX > maxX || sMaxX < minX || sMinY > maxY || sMaxY < minY);
      });

      if (touched.length === 0) return;

      const updatedShapes = shapes.map((s) => ({ ...s }));

      await Promise.all(
        touched.map(async (shape) => {
          const w = Math.max(1, Math.round(shape.width));
          const h = Math.max(1, Math.round(shape.height));
          const off = document.createElement('canvas');
          off.width = w;
          off.height = h;
          const ctx = off.getContext('2d');
          if (!ctx) return;

          // Draw the shape into the offscreen canvas at (0, 0)
          try {
            switch (shape.type) {
              case 'Rectangle':
                Shapes.drawRectangleShape(
                  ctx,
                  0,
                  0,
                  w,
                  h,
                  shape.fillColor,
                  shape.imageElement,
                  shape.borderType,
                  shape.borderSize,
                  shape.borderColor
                );
                break;
              case 'Square':
                Shapes.drawSquareShape(
                  ctx,
                  0,
                  0,
                  w,
                  h,
                  shape.fillColor,
                  shape.imageElement,
                  shape.borderType,
                  shape.borderSize,
                  shape.borderColor
                );
                break;
              case 'Circle':
                Shapes.drawCircleShape(
                  ctx,
                  0,
                  0,
                  w,
                  h,
                  shape.fillColor,
                  shape.imageElement,
                  shape.borderType,
                  shape.borderSize,
                  shape.borderColor
                );
                break;
              case 'Line':
                Shapes.drawLineShape(
                  ctx,
                  0,
                  0,
                  w,
                  h,
                  undefined,
                  undefined,
                  shape.borderType,
                  shape.borderSize,
                  shape.borderColor
                );
                break;
              case 'Diamond':
              case 'Diamond / Rhombus':
                Shapes.drawDiamondShape(
                  ctx,
                  0,
                  0,
                  w,
                  h,
                  shape.fillColor,
                  shape.imageElement,
                  shape.borderType,
                  shape.borderSize,
                  shape.borderColor
                );
                break;
              case 'Heart':
                Shapes.drawHeartShape(
                  ctx,
                  0,
                  0,
                  w,
                  h,
                  shape.fillColor,
                  shape.imageElement,
                  shape.borderType,
                  shape.borderSize,
                  shape.borderColor
                );
                break;
              case 'text':
                // simple text rendering for rasterization
                ctx.fillStyle =
                  typeof shape.textColor === 'string' ? shape.textColor : '#000';
                ctx.font = `${shape.fontStyles?.italic ? 'italic ' : ''
                  }${shape.fontStyles?.bold ? 'bold ' : ''}${shape.fontSize ?? 16
                  }px ${shape.fontFamily ?? 'Arial'}`;
                ctx.textBaseline = 'top';
                const lines = ((shape.text || '') as string).split('\n');
                let ty = 4;
                for (const ln of lines) {
                  ctx.fillText(ln, 4, ty);
                  ty += Math.round((shape.fontSize ?? 16) * 1.25);
                }
                break;
              default: {
                // try generic draw function, e.g. 'Star (5-point)' -> drawStar5pointShape
                type ShapeDrawFn = (
                  ctx: CanvasRenderingContext2D,
                  x: number,
                  y: number,
                  w: number,
                  h: number,
                  fillColor?: string,
                  imageElement?: HTMLImageElement,
                  borderType?: string,
                  borderSize?: number,
                  borderColor?: string
                ) => void;

                type ShapeDrawMap = Record<string, ShapeDrawFn>;
                const drawMap = Shapes as unknown as ShapeDrawMap;
                const fnName = `draw${shape.type.replace(/\s+/g, '')}Shape`;
                const maybeFn = drawMap[fnName];

                if (typeof maybeFn === 'function') {
                  try {
                    maybeFn(
                      ctx,
                      0,
                      0,
                      w,
                      h,
                      shape.fillColor,
                      shape.imageElement,
                      shape.borderType,
                      shape.borderSize,
                      shape.borderColor
                    );
                  } catch {
                    ctx.fillStyle = shape.fillColor ?? '#fff';
                    ctx.fillRect(0, 0, w, h);
                  }
                } else {
                  ctx.fillStyle = shape.fillColor ?? '#fff';
                  ctx.fillRect(0, 0, w, h);
                }
                break;
              }
            }
          } catch {
            ctx.fillStyle = shape.fillColor ?? '#fff';
            ctx.fillRect(0, 0, w, h);
          }

          // Apply eraser path (coords relative to shape top-left)
          ctx.save();
          ctx.globalCompositeOperation = 'destination-out';
          ctx.lineWidth = path.size || eraserSize;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          const adjusted = path.points.map((p) => ({
            x: p.x - shape.x,
            y: p.y - shape.y,
          }));
          ctx.moveTo(adjusted[0].x, adjusted[0].y);
          for (let i = 1; i < adjusted.length; i++) {
            ctx.lineTo(adjusted[i].x, adjusted[i].y);
          }
          ctx.stroke();
          ctx.restore();

          // Convert to Image and store on shape
          const dataUrl = off.toDataURL('image/png');
          const img = new Image();
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = dataUrl;
          });

          const idx = updatedShapes.findIndex((s) => s.id === shape.id);
          if (idx !== -1) {
            updatedShapes[idx] = {
              ...updatedShapes[idx],
              imageElement: img,
              imageUrl: dataUrl,
              rasterized: true,
            } as Shape;
          }
        })
      );

      // commit shape updates
      onShapesChange(() => updatedShapes);
    };

    const canvases = Array.from(
      document.querySelectorAll<HTMLCanvasElement>('.drawing-panel')
    );
    const cleanupFns: (() => void)[] = [];

    canvases.forEach((canvas) => {
      const getPos = (e: MouseEvent | TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        const clientX =
          (e as MouseEvent).clientX ??
          (e as TouchEvent).touches?.[0]?.clientX;
        const clientY =
          (e as MouseEvent).clientY ??
          (e as TouchEvent).touches?.[0]?.clientY;
        const x =
          ((clientX as number) - rect.left) * (canvas.width / rect.width);
        const y =
          ((clientY as number) - rect.top) * (canvas.height / rect.height);
        return { x, y };
      };

      const handlePointerDown = (e: MouseEvent | TouchEvent) => {
        if (!pencilActive && !eraserActive) return;
        if (!canEdit) return;

        isDrawingRef.current = true;
        const panelId = canvas.getAttribute('data-panel-id') || 'default';
        currentPanelRef.current = panelId;

        const pos = getPos(e);
        const tool: 'pencil' | 'eraser' = eraserActive ? 'eraser' : 'pencil';
        currentPathRef.current = {
          points: [{ x: pos.x, y: pos.y }],
          tool,
          color: tool === 'pencil' ? '#000' : undefined,
          size: tool === 'eraser' ? eraserSize : 2,
        };

        // push initial path into drawings
        setDrawings((prev) => {
          const copy = [...prev];
          const idx = copy.findIndex((p) => p.panelId === panelId);
          if (idx === -1) {
            copy.push({ panelId, paths: [currentPathRef.current as DrawingPath] });
          } else {
            copy[idx] = {
              ...copy[idx],
              paths: [...copy[idx].paths, currentPathRef.current as DrawingPath],
            };
          }
          return copy;
        });

        (e as MouseEvent).preventDefault?.();
      };

      const handlePointerMove = (e: MouseEvent | TouchEvent) => {
        if (!isDrawingRef.current || !currentPathRef.current) return;
        if (!canEdit) return;

        const pos = getPos(e);
        const last =
          currentPathRef.current.points[
          currentPathRef.current.points.length - 1
          ];
        if (distance(last, pos) < 1) return;

        currentPathRef.current.points.push(pos);

        // live drawing on the canvas for feedback
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.save();
        if (currentPathRef.current.tool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.lineWidth = currentPathRef.current.size || eraserSize;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          const pts = currentPathRef.current.points;
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.stroke();
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = currentPathRef.current.color || '#000';
          ctx.lineWidth = currentPathRef.current.size || 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          const pts = currentPathRef.current.points;
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.stroke();
        }
        ctx.restore();

        // update drawings state too
        setDrawings((prev) =>
          prev.map((d) => {
            if (d.panelId !== currentPanelRef.current) return d;
            if (d.paths.length === 0) return d;
            const lastPath = d.paths[d.paths.length - 1];
            const updatedLast = {
              ...lastPath,
              points: [...lastPath.points, pos],
            };
            return {
              ...d,
              paths: [...d.paths.slice(0, -1), updatedLast],
            };
          })
        );
      };

      const finalizePath = async () => {
        if (!currentPathRef.current) return;

        // Ensure final path is in state (defensive)
        setDrawings((prev) => {
          const copy = [...prev];
          const idx = copy.findIndex(
            (p) => p.panelId === currentPanelRef.current
          );
          if (idx === -1) {
            copy.push({
              panelId: currentPanelRef.current,
              paths: [currentPathRef.current as DrawingPath],
            });
          } else {
            const paths = copy[idx].paths;
            if (
              paths.length === 0 ||
              paths[paths.length - 1] !== currentPathRef.current
            ) {
              copy[idx] = {
                ...copy[idx],
                paths: [...paths, currentPathRef.current as DrawingPath],
              };
            }
          }
          return copy;
        });

        // If eraser, apply to shapes
        if (currentPathRef.current.tool === 'eraser') {
          try {
            await processEraserPathOnShapes(currentPathRef.current);
          } catch (err) {
            console.error('Eraser processing failed', err);
          }
        }

        currentPathRef.current = null;
        if (onSaveState) onSaveState();
      };

      const handlePointerUp = () => {
        if (!canEdit) return;
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;
        void finalizePath();
      };

      canvas.addEventListener('mousedown', handlePointerDown);
      canvas.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);

      canvas.addEventListener('touchstart', handlePointerDown, {
        passive: false,
      });
      canvas.addEventListener('touchmove', handlePointerMove, {
        passive: false,
      });
      window.addEventListener('touchend', handlePointerUp);

      cleanupFns.push(() => {
        canvas.removeEventListener('mousedown', handlePointerDown);
        canvas.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('mouseup', handlePointerUp);

        canvas.removeEventListener('touchstart', handlePointerDown);
        canvas.removeEventListener('touchmove', handlePointerMove);
        window.removeEventListener('touchend', handlePointerUp);
      });
    });

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, [
    canEdit,
    pencilActive,
    eraserActive,
    eraserSize,
    splitMode,
    setDrawings,
    onSaveState,
    shapes,
    onShapesChange,
  ]);
};
