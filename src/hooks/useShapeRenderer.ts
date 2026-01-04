import { useEffect } from 'react';
import * as Shapes from '../app/components/shapes/index';
import { Shape, UseShapeRendererProps } from '@/types';

export const useShapeRenderer = ({
    shapes,
    drawings,
    filledImages,
    splitMode,
    textInput,
    editingShapeId,
    loadedImage,
    backgroundColor,
    // permission
}: UseShapeRendererProps) => {
    useEffect(() => {
        const canvases = document.querySelectorAll<HTMLCanvasElement>(".drawing-panel");

        canvases.forEach((canvas) => {
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const panelId = canvas.getAttribute("data-panel-id") || "default";

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw background color first
            const panelColor = (backgroundColor && (backgroundColor[panelId] ?? backgroundColor.default)) || "#ffffff";
            if (typeof panelColor === 'string') {
                ctx.fillStyle = panelColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (panelColor && typeof panelColor === 'object') {
                // Handle gradient background
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, panelColor.start);
                gradient.addColorStop(1, panelColor.end);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Draw filled images for this panel
            const panelFilledImages = filledImages.filter(img => img.panelId === panelId);
            panelFilledImages.forEach(({ imageData }) => {
                try {
                    ctx.putImageData(imageData, 0, 0);
                } catch (err) {
                    console.warn('putImageData failed', err);
                }
            });

            // Draw drawings for this panel
            const panelDrawings = drawings.find(d => d.panelId === panelId);
            if (panelDrawings) {
                try {
                    panelDrawings.paths.filter(path => path != null && typeof path === 'object' && path.points != null && Array.isArray(path.points) && path.points.length >= 2).forEach(path => {
                        ctx.beginPath();
                        ctx.moveTo(path.points[0].x, path.points[0].y);
                        for (let i = 1; i < path.points.length; i++) {
                            ctx.lineTo(path.points[i].x, path.points[i].y);
                        }
                        if (path.tool === 'eraser') {
                            ctx.globalCompositeOperation = "destination-out";
                            ctx.lineWidth = path.size || 10;
                            ctx.lineCap = "round";
                            ctx.stroke();
                            ctx.globalCompositeOperation = "source-over";
                        } else {
                            ctx.globalCompositeOperation = "source-over";
                            ctx.lineWidth = path.size || 2;
                            ctx.lineCap = "round";
                            ctx.strokeStyle = path.color || "#000";
                            ctx.stroke();
                        }
                    });
                } catch (error) {
                    console.error('Error rendering drawings:', error);
                }
            }



            // Draw shapes for this panel only
            shapes.filter(shape => shape.panelId === panelId).forEach((shape) => {
                renderShape(ctx, shape, textInput, editingShapeId);
            });
        });
    }, [shapes, drawings, filledImages, splitMode, textInput, editingShapeId, loadedImage, backgroundColor]);
};

// Helper function to render individual shapes
const renderShape = (
    ctx: CanvasRenderingContext2D,
    shape: Shape,
    textInput: string,
    editingShapeId: string | null
) => {
    switch (shape.type) {
        case "Rectangle":
            Shapes.drawRectangleShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Square":
            Shapes.drawSquareShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Circle":
            Shapes.drawCircleShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Triangle":
            Shapes.drawTriangleShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Line":
            Shapes.drawLineShape(ctx, shape.x, shape.y, shape.width, shape.height, undefined, undefined, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Diamond":
            Shapes.drawDiamondShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Star":
            Shapes.drawStarShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Ellipse / Oval":
            Shapes.drawEllipseShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Diamond / Rhombus":
            Shapes.drawDiamondShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Hexagon":
            Shapes.drawHexagonShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Octagon":
            Shapes.drawOctagonShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Parallelogram":
            Shapes.drawParallelogramShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Pentagon":
            Shapes.drawPentagonShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Polygon":
            Shapes.drawPolygonShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Right Triangle":
            Shapes.drawRightTriangleShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Trapezoid":
            Shapes.drawTrapezoidShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Arc":
            Shapes.drawArcShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Chord":
            Shapes.drawChordShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Cone":
            Shapes.drawConeShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa");
            break;
        case "Crescent":
            Shapes.drawCrescentShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa");
            break;
        case "Cube (3D)":
            Shapes.drawCubeShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Cylinder":
            Shapes.drawCylinderShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.borderSize, shape.borderColor);
            break;
        case "Pyramid":
            Shapes.drawPyramidShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Ring / Donut":
            Shapes.drawRingShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Sector":
            Shapes.drawSectorShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Sphere":
            Shapes.drawSphereShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Star (5-point)":
            Shapes.drawStar5Shape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Star (6-point)":
            Shapes.drawStar6Shape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Burst / Explosion":
            Shapes.drawBurstShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Heart":
            Shapes.drawHeartShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Cloud":
            Shapes.drawCloudShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Banner":
            Shapes.drawBannerShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Badge":
            Shapes.drawBadgeShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Speech Bubble":
            Shapes.drawSpeechBubbleShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Callout":
            Shapes.drawCalloutShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Arrow":
            Shapes.drawArrowShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa");
            break;
        case "Bent Arrow":
            Shapes.drawBentArrowShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa");
            break;
        case "Circular Arrow":
            Shapes.drawCircularArrowShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa");
            break;
        case "Curved Arrow":
            Shapes.drawCurvedArrowShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa");
            break;
        case "Dashed Connector":
            Shapes.drawDashedConnectorShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa");
            break;
        case "Double Arrow":
            Shapes.drawDoubleArrowShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa");
            break;
        case "Split Arrow":
            Shapes.drawSplitArrowShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa");
            break;
        case "Terminator (Start/End)":
            Shapes.drawTerminatorShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Process":
            Shapes.drawProcessShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Decision":
            Shapes.drawDecisionShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Input / Output":
            Shapes.drawInputOutputShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Preparation":
            Shapes.drawPreparationShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Connector":
            Shapes.drawConnectorShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Document":
            Shapes.drawDocumentShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Delay":
            Shapes.drawDelayShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Manual Input":
            Shapes.drawManualInputShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Database":
            Shapes.drawDatabaseShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Frame":
            Shapes.drawFrameShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Divider Line":
            Shapes.drawDividerShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Checkbox":
            Shapes.drawCheckboxShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa");
            break;
        case "Radio Button":
            Shapes.drawRadioButtonShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa");
            break;
        case "Button Shape":
            Shapes.drawButtonShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa");
            break;
        case "Tab Shape":
            Shapes.drawTabShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa");
            break;
        case "Card":
            Shapes.drawCardShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "Timeline Node":
            Shapes.drawTimelineNodeShape(ctx, shape.x, shape.y, shape.width, shape.height, shape.fillColor || "#60a5fa", shape.imageElement, shape.borderType, shape.borderSize, shape.borderColor);
            break;
        case "text":
            renderTextShape(ctx, shape, textInput, editingShapeId);
            break;
        default:
            // For now, skip unsupported shapes to avoid errors
            break;
    }

    // Draw selection outline and handles
    if (shape.selected) {
        drawSelectionHandles(ctx, shape);
    }
};

// Text rendering logic
const renderTextShape = (
    ctx: CanvasRenderingContext2D,
    shape: Shape,
    textInput: string,
    editingShapeId: string | null
) => {
    const fontFamily = (shape.fontFamily && String(shape.fontFamily)) || "Arial, sans-serif";
    const fontSize = typeof shape.fontSize === 'number' ? shape.fontSize : 16;
    const fontStyles = shape.fontStyles ?? { bold: false, italic: false, underline: false, strikethrough: false };
    const listType = shape.listType ?? 'none';
    const textAlignment = shape.textAlignment ?? 'left';
    const textColorProp = shape.textColor ?? "#000000";

    const fontWeight = fontStyles.bold ? "bold" : "normal";
    const fontStyle = fontStyles.italic ? "italic" : "normal";

    // Build the font string
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textBaseline = "top";

    // Map alignment (canvas doesn't support 'justify')
    const canvasTextAlign = textAlignment === 'justify' ? 'left' : (textAlignment as CanvasTextAlign);
    ctx.textAlign = canvasTextAlign;

    // Determine fillStyle for text (support string or object with type 'solid' or 'gradient')
    const computeTextFillStyle = () => {
        if (typeof textColorProp === 'string') {
            return String(textColorProp);
        }
        if (typeof textColorProp === 'object') {
            // object shape: { type: 'solid'|'gradient', value: ... }
            if ((textColorProp).type === 'gradient') {
                const gradientValue = (textColorProp).value as { start: string; end: string };
                const gradient = ctx.createLinearGradient(shape.x, shape.y, shape.x + shape.width, shape.y + shape.height);
                gradient.addColorStop(0, gradientValue.start);
                gradient.addColorStop(1, gradientValue.end);
                return gradient;
            } else if ((textColorProp).type === 'solid') {
                const value = (textColorProp).value;
                return typeof value === 'string' ? value : "#000000";
            }
        }
        return "#000000";
    };

    const textFillStyle = computeTextFillStyle();

    const textHeight = fontSize;
    const lineHeight = Math.round(fontSize * 1.25);
    const maxWidth = Math.max(8, shape.width - 8);

    // If editing/selected, draw a translucent background and border to indicate text box
    // ALSO: if the shape has explicit border properties, draw that border (1px black for our textboxes)
    if (shape.isEditing || shape.selected || shape.borderType) {
        // Draw background (semi-transparent white so text remains readable) — only if editing/selected
        if (shape.isEditing || shape.selected) {
            ctx.save();
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
            ctx.restore();
        }

        // Draw border if borderType present (we prefer explicit border settings)
        if (shape.borderType) {
            ctx.save();
            ctx.strokeStyle = shape.borderColor ?? "#000";
            ctx.lineWidth = (typeof shape.borderSize === 'number' ? shape.borderSize : 1);
            const dash = shape.borderType === 'dashed' ? [6, 4] : shape.borderType === 'dotted' ? [2, 2] : [];
            ctx.setLineDash(dash);
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            ctx.setLineDash([]);
            ctx.restore();
        } else if (shape.isEditing || shape.selected) {
            // fallback visual border for editing state (previous behaviour)
            ctx.save();
            ctx.strokeStyle = "#007bff";
            ctx.lineWidth = 2;
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            ctx.restore();
        }
    }

    // Clip to box
    ctx.save();
    ctx.beginPath();
    ctx.rect(shape.x, shape.y, shape.width, shape.height);
    ctx.clip();

    // Wrap text function (unchanged)
    const wrapText = (text: string, isEditing = false) => {
        const lines: string[] = [];
        let currentLine = '';
        const words = text.split(' ');

        const breakLongWord = (word: string) => {
            const pieces: string[] = [];
            let buffer = '';
            for (const ch of word) {
                if (ctx.measureText(buffer + ch).width <= maxWidth) {
                    buffer += ch;
                } else {
                    if (buffer) pieces.push(buffer);
                    buffer = ch;
                }
            }
            if (buffer) pieces.push(buffer);
            return pieces;
        };

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const test = currentLine ? `${currentLine} ${word}` : word;
            const width = ctx.measureText(test).width;

            if (width > maxWidth) {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = '';
                }
                const broken = breakLongWord(word);
                for (let b = 0; b < broken.length; b++) {
                    if (b < broken.length - 1) lines.push(broken[b]);
                    else currentLine = broken[b];
                }
            } else {
                currentLine = test;
            }
        }

        if (currentLine) lines.push(currentLine);

        // handle lists
        if (listType && listType !== 'none') {
            for (let i = 0; i < lines.length; i++) {
                if (listType === 'bullet') lines[i] = '• ' + lines[i];
                else if (listType === 'number') lines[i] = `${i + 1}. ${lines[i]}`;
            }
        }

        if (isEditing && lines.length > 0) {
            const lastIndex = lines.length - 1;
            // blinking cursor
            lines[lastIndex] = lines[lastIndex] + (Date.now() % 1000 < 500 ? '|' : '');
        }

        return lines;
    };

    // Choose source text
    const sourceText = shape.isEditing && shape.id === editingShapeId ? textInput : (shape.text || "");
    const lines = wrapText(sourceText, shape.isEditing);

    // Set fillStyle for text
    (ctx.fillStyle as unknown) = textFillStyle as unknown;

    // Helper to get x pos based on alignment and metrics
    const getXForLine = () => {
        if (canvasTextAlign === 'center') {
            return shape.x + shape.width / 2;
        } else if (canvasTextAlign === 'right') {
            return shape.x + shape.width - 4;
        }
        // left
        return shape.x + 4;
    };

    // Draw all lines
    let y = shape.y + 4; // small top padding
    for (const line of lines) {
        if (y > shape.y + shape.height - textHeight) break;

        const xPos = getXForLine();

        // draw text
        ctx.fillText(line, xPos, y);

        // Draw underline / strikethrough if requested
        if (fontStyles.underline || fontStyles.strikethrough) {
            const visibleLine = line.replace(/\|$/, '');
            const _metrics = ctx.measureText(visibleLine);
            const metricsWidth = _metrics.width;
            let leftX = xPos;
            if (canvasTextAlign === 'center') leftX = xPos - metricsWidth / 2;
            else if (canvasTextAlign === 'right') leftX = xPos - metricsWidth;

            const strokeColor = (typeof textFillStyle === 'string') ? textFillStyle : "#000";
            ctx.strokeStyle = strokeColor as string;
            ctx.lineWidth = Math.max(1, Math.round(fontSize / 12));

            if (fontStyles.underline) {
                const underlineY = y + textHeight + 2;
                ctx.beginPath();
                ctx.moveTo(leftX, underlineY);
                ctx.lineTo(leftX + metricsWidth, underlineY);
                ctx.stroke();
            }
            if (fontStyles.strikethrough) {
                const strikeY = y + (textHeight / 2);
                ctx.beginPath();
                ctx.moveTo(leftX, strikeY);
                ctx.lineTo(leftX + metricsWidth, strikeY);
                ctx.stroke();
            }
        }

        y += lineHeight;
    }

    ctx.restore();

    // Reset text alignment to left for other rendering
    ctx.textAlign = 'left';
};


// Selection handles rendering
const drawSelectionHandles = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.strokeStyle = "#007bff";
    ctx.lineWidth = 2;
    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);

    // Draw resize handles
    const handleSize = 8;
    ctx.fillStyle = "#007bff";
    // Top-left
    ctx.fillRect(shape.x - handleSize / 2, shape.y - handleSize / 2, handleSize, handleSize);
    // Top-right
    ctx.fillRect(shape.x + shape.width - handleSize / 2, shape.y - handleSize / 2, handleSize, handleSize);
    // Bottom-left
    ctx.fillRect(shape.x - handleSize / 2, shape.y + shape.height - handleSize / 2, handleSize, handleSize);
    // Bottom-right
    ctx.fillRect(shape.x + shape.width - handleSize / 2, shape.y + shape.height - handleSize / 2, handleSize, handleSize);
};
