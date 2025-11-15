import { useEffect } from 'react';
import * as Shapes from '../app/components/shapes/index';
import { Shape } from '../types';

interface UseShapeRendererProps {
    shapes: Shape[];
    drawings: { panelId: string; paths: Array<{ points: { x: number; y: number }[]; tool: 'pencil' | 'eraser'; color?: string; size?: number }> }[];
    filledImages: { panelId: string; imageData: ImageData }[];
    splitMode: string;
    textInput: string;
    editingShapeId: string | null;
    loadedImage?: HTMLImageElement | null;
    backgroundColor?: Record<string, string | { start: string; end: string }>;
}

export const useShapeRenderer = ({
    shapes,
    drawings,
    filledImages,
    splitMode,
    textInput,
    editingShapeId,
    loadedImage,
    backgroundColor,
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
            const panelColor = backgroundColor?.[panelId] || backgroundColor?.default || "#ffffff";
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
                ctx.putImageData(imageData, 0, 0);
            });

            // Draw drawings for this panel
            const panelDrawings = drawings.find(d => d.panelId === panelId);
            if (panelDrawings) {
                panelDrawings.paths.forEach(path => {
                    if (path.points.length < 2) return;
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
    // Apply font styles with all font features
    const fontFamily = shape.fontFamily || "sans-serif";
    const fontSize = shape.fontSize || 16;
    const fontWeight = shape.fontStyles?.bold ? "bold" : "normal";
    const fontStyle = shape.fontStyles?.italic ? "italic" : "normal";

    // Build the complete font string
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textBaseline = "top";

    // Apply text alignment
    const textAlign = shape.textAlignment || 'left';
    // CanvasRenderingContext2D.textAlign does not support 'justify', map it to a supported value
    const canvasTextAlign = textAlign === 'justify' ? 'left' : (textAlign as CanvasTextAlign);
    ctx.textAlign = canvasTextAlign;

    // Apply text color (solid or gradient)
    if (typeof shape.textColor === 'string') {
        ctx.fillStyle = shape.textColor;
    } else if (shape.textColor && typeof shape.textColor === 'object' && shape.textColor.type === 'gradient') {
        const gradientValue = shape.textColor.value as { start: string; end: string };
        const gradient = ctx.createLinearGradient(
            shape.x,
            shape.y,
            shape.x + shape.width,
            shape.y + shape.height
        );
        gradient.addColorStop(0, gradientValue.start);
        gradient.addColorStop(1, gradientValue.end);
        ctx.fillStyle = gradient;
    } else {
        ctx.fillStyle = "#000000";
    }

    const textHeight = fontSize;
    const lineHeight = textHeight + 4;
    const maxWidth = shape.width - 8;

    if (shape.isEditing || shape.selected) {
        // Draw background for the textbox
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);

        // Draw border
        ctx.strokeStyle = "#007bff";
        ctx.lineWidth = 2;
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);

        // Reset fill style for text
        if (typeof shape.textColor === 'string') {
            ctx.fillStyle = shape.textColor;
        } else if (shape.textColor && typeof shape.textColor === 'object' && shape.textColor.type === 'gradient') {
            const gradientValue = shape.textColor.value as { start: string; end: string };
            const gradient = ctx.createLinearGradient(
                shape.x,
                shape.y,
                shape.x + shape.width,
                shape.y + shape.height
            );
            gradient.addColorStop(0, gradientValue.start);
            gradient.addColorStop(1, gradientValue.end);
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = "#000000";
        }
    }

    // Clip text to the box to prevent overflow
    ctx.save();
    ctx.beginPath();
    ctx.rect(shape.x, shape.y, shape.width, shape.height);
    ctx.clip();

    const wrapText = (text: string, isEditing: boolean = false) => {
        const lines: string[] = [];
        let currentLine = '';
        const words = text.split(' ');

        const breakLineIfNeeded = (line: string) => {
            if (ctx.measureText(line).width <= maxWidth) return [line];
            const brokenLines: string[] = [];
            let current = '';
            for (const char of line) {
                if (ctx.measureText(current + char).width <= maxWidth) {
                    current += char;
                } else {
                    if (current) brokenLines.push(current);
                    current = char;
                }
            }
            if (current) brokenLines.push(current);
            return brokenLines;
        };

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            // Handle line breaks for list items
            if (shape.listType !== 'none' && word.includes('\n')) {
                const parts = word.split('\n');
                for (let j = 0; j < parts.length; j++) {
                    if (j > 0) {
                        lines.push(currentLine);
                        currentLine = '';
                    }
                    const testLine = currentLine + (currentLine ? ' ' : '') + parts[j];
                    const metrics = ctx.measureText(testLine);

                    if (metrics.width > maxWidth && currentLine !== '') {
                        lines.push(currentLine);
                        const broken = breakLineIfNeeded(parts[j]);
                        lines.push(...broken.slice(0, -1));
                        currentLine = broken[broken.length - 1] || '';
                    } else {
                        currentLine = testLine;
                        const broken = breakLineIfNeeded(currentLine);
                        if (broken.length > 1) {
                            lines.push(...broken.slice(0, -1));
                            currentLine = broken[broken.length - 1];
                        }
                    }
                }
            } else {
                const testLine = currentLine + (currentLine ? ' ' : '') + word;
                const metrics = ctx.measureText(testLine);

                if (metrics.width > maxWidth && currentLine !== '') {
                    lines.push(currentLine);
                    const broken = breakLineIfNeeded(word);
                    lines.push(...broken.slice(0, -1));
                    currentLine = broken[broken.length - 1] || '';
                } else {
                    currentLine = testLine;
                    const broken = breakLineIfNeeded(currentLine);
                    if (broken.length > 1) {
                        lines.push(...broken.slice(0, -1));
                        currentLine = broken[broken.length - 1];
                    }
                }
            }
        }

        if (currentLine) {
            const broken = breakLineIfNeeded(currentLine);
            lines.push(...broken);
        }

        // Add list markers
        if (shape.listType !== 'none') {
            for (let i = 0; i < lines.length; i++) {
                if (shape.listType === 'bullet') {
                    lines[i] = '• ' + lines[i];
                } else if (shape.listType === 'number') {
                    lines[i] = (i + 1) + '. ' + lines[i];
                }
            }
        }

        // If editing, add cursor to the last line
        if (isEditing) {
            const lastLineIndex = lines.length - 1;
            lines[lastLineIndex] += (Date.now() % 1000 < 500 ? "|" : "");
        }

        return lines;
    };

    let lines: string[];
    if (shape.isEditing) {
        const currentText = shape.id === editingShapeId ? textInput : (shape.text || "");
        lines = wrapText(currentText, true);
    } else {
        lines = wrapText(shape.text || "");
    }

    // Calculate text positioning based on alignment
    const getTextXPosition = () => {
        switch (textAlign) {
            case 'center':
                return shape.x + (shape.width / 2);
            case 'right':
                return shape.x + shape.width - 4;
            case 'left':
            default:
                return shape.x + 4;
        }
    };

    // Draw each line with proper alignment and formatting
    let y = shape.y + textHeight;
    for (const line of lines) {
        if (y > shape.y + shape.height - textHeight) break; // Stop if beyond box height

        const xPos = getTextXPosition();

        // Draw the text
        ctx.fillText(line, xPos, y);

        // Draw text decorations (underline and strikethrough)
        if (shape.fontStyles) {
            const metrics = ctx.measureText(line);
            const textY = y;

            if (shape.fontStyles.underline) {
                ctx.strokeStyle = ctx.fillStyle as string;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(xPos, textY + textHeight + 2);
                ctx.lineTo(xPos + metrics.width, textY + textHeight + 2);
                ctx.stroke();
            }

            if (shape.fontStyles.strikethrough) {
                ctx.strokeStyle = ctx.fillStyle as string;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(xPos, textY + (textHeight / 2));
                ctx.lineTo(xPos + metrics.width, textY + (textHeight / 2));
                ctx.stroke();
            }
        }

        y += lineHeight;
    }

    ctx.restore();

    // Reset text alignment to default for other shapes
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