import { useEffect } from 'react';
import { Shape, FontStyles } from '../types';

const MIN_SHAPE_WIDTH = 20;
const MIN_SHAPE_HEIGHT = 20;

interface UseTextToolsProps {
    textActive: boolean;
    shapes: Shape[];
    textInput: string;
    editingShapeId: string | null;
    currentFontFeatures: {
        fontFamily: string;
        fontSize: number;
        fontStyles: FontStyles;
        alignment: 'left' | 'center' | 'right' | 'justify';
        listType: 'bullet' | 'number' | 'none';
        textColor: string | { type: 'solid' | 'gradient'; value: string | { start: string; end: string } };
    };
    onShapesChange: React.Dispatch<React.SetStateAction<Shape[]>>;
    setTextInput: React.Dispatch<React.SetStateAction<string>>;
    setEditingShapeId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useTextTools = ({
    textActive,
    shapes,
    textInput,
    editingShapeId,
    currentFontFeatures,
    onShapesChange,
    setTextInput,
    setEditingShapeId
}: UseTextToolsProps) => {
    // Text creation logic
    useEffect(() => {
        const canvases = document.querySelectorAll<HTMLCanvasElement>(".drawing-panel");
        const cleanupFunctions: (() => void)[] = [];

        canvases.forEach((canvas) => {
            const handleMouseDown = (e: MouseEvent) => {
                if (!textActive) return;

                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                const mouseX = (e.clientX - rect.left) * scaleX;
                const mouseY = (e.clientY - rect.top) * scaleY;

                // Check if clicking on existing text
                let clickedOnText = false;
                shapes.forEach((shape) => {
                    if (shape.type === "text") {
                        if (mouseX >= shape.x && mouseX <= shape.x + shape.width &&
                            mouseY >= shape.y && mouseY <= shape.y + shape.height) {
                            clickedOnText = true;

                            // Start editing existing text
                            onShapesChange(prev => prev.map(s =>
                                s.id === shape.id
                                    ? { ...s, isEditing: true, selected: true }
                                    : { ...s, isEditing: false, selected: false }
                            ));
                            setTextInput(shape.text || "");
                            setEditingShapeId(shape.id);
                        }
                    }
                });

                if (!clickedOnText) {
                    // Create new text shape
                    const panelId = canvas.getAttribute("data-panel-id") || "default";
                    const newShape: Shape = {
                        id: `text-${Date.now()}-${Math.random()}`,
                        type: "text",
                        x: mouseX,
                        y: mouseY,
                        width: Math.max(200, MIN_SHAPE_WIDTH), // Increased default width
                        height: Math.max(60, MIN_SHAPE_HEIGHT), // Increased default height
                        selected: true,
                        panelId: panelId,
                        text: "",
                        fontSize: currentFontFeatures.fontSize,
                        fontFamily: currentFontFeatures.fontFamily,
                        textColor: currentFontFeatures.textColor,
                        fontStyles: currentFontFeatures.fontStyles,
                        textAlignment: currentFontFeatures.alignment,
                        listType: currentFontFeatures.listType,
                        isEditing: true,
                    };

                    onShapesChange(prev => [...prev.map(s => ({ ...s, selected: false })), newShape]);
                    setTextInput("");
                    setEditingShapeId(newShape.id);
                }
            };

            canvas.addEventListener("mousedown", handleMouseDown);
            cleanupFunctions.push(() => {
                canvas.removeEventListener("mousedown", handleMouseDown);
            });
        });

        return () => {
            cleanupFunctions.forEach(cleanup => cleanup());
        };
    }, [textActive, shapes, currentFontFeatures, onShapesChange, setTextInput, setEditingShapeId]);

    // Consolidated text input handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const editingShape = shapes.find(shape => shape.isEditing && shape.type === "text");

            if (!editingShape) return;

            // Prevent default for these keys to avoid browser behavior
            if (e.key === "Escape" || e.key === "Enter") {
                e.preventDefault();
                // Finish editing
                onShapesChange(prev => prev.map(shape =>
                    shape.id === editingShape.id
                        ? {
                            ...shape,
                            isEditing: false,
                            text: textInput,
                            // Ensure font features are preserved
                            fontSize: currentFontFeatures.fontSize,
                            fontFamily: currentFontFeatures.fontFamily,
                            textColor: currentFontFeatures.textColor,
                            fontStyles: currentFontFeatures.fontStyles,
                            textAlignment: currentFontFeatures.alignment,
                            listType: currentFontFeatures.listType
                        }
                        : shape
                ));
                setEditingShapeId(null);
            } else if (e.key === "Backspace") {
                e.preventDefault();
                setTextInput(prev => prev.slice(0, -1));
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                setTextInput(prev => prev + e.key);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [shapes, textInput, setTextInput, currentFontFeatures, onShapesChange, setEditingShapeId]);

    // Focus management for text input
    useEffect(() => {
        if (editingShapeId) {
            const canvas = document.querySelector<HTMLCanvasElement>(".drawing-panel");
            if (canvas) {
                canvas.focus();
            }
        }
    }, [editingShapeId]);

    // Force re-render during text editing for smooth cursor
    useEffect(() => {
        if (!editingShapeId) return;

        const interval = setInterval(() => {
            // This will force a re-render of the canvas, making the cursor blink
            onShapesChange(prev => [...prev]);
        }, 500);

        return () => clearInterval(interval);
    }, [editingShapeId, onShapesChange]);
};