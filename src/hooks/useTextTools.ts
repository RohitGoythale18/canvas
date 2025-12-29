'use client';
import { useEffect, useCallback } from 'react';
import { Shape, FontStyles } from '../types';

const MIN_SHAPE_WIDTH = 20;
const MIN_SHAPE_HEIGHT = 20;

interface UseTextToolsProps {
    textActive: boolean;
    shapes: Shape[];
    textInput: string;
    editingShapeId: string | null;
    currentFontFeatures?: {
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
    onTextToggle?: (enabled: boolean) => void;
}

const DEFAULT_FONT_FEATURES = {
    fontFamily: "Arial, sans-serif",
    fontSize: 16,
    fontStyles: {
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false
    } as FontStyles,
    alignment: 'left' as const,
    listType: 'none' as const,
    textColor: "#000000"
};

export const useTextTools = ({
    textActive,
    shapes,
    textInput,
    editingShapeId,
    currentFontFeatures,
    onShapesChange,
    setTextInput,
    setEditingShapeId,
    onTextToggle
}: UseTextToolsProps) => {
    const fontFeatures = currentFontFeatures ?? DEFAULT_FONT_FEATURES;

    const commitEditing = useCallback((id: string | null) => {
        if (!id) return;
        onShapesChange(prev => prev.map(shape =>
            shape.id === id
                ? {
                    ...shape,
                    isEditing: false,
                    text: textInput,
                    fontSize: fontFeatures.fontSize,
                    fontFamily: fontFeatures.fontFamily,
                    textColor: fontFeatures.textColor,
                    fontStyles: fontFeatures.fontStyles,
                    textAlignment: fontFeatures.alignment,
                    listType: fontFeatures.listType,
                    borderType: shape.borderType ?? 'solid',
                    borderSize: shape.borderSize ?? 1,
                    borderColor: shape.borderColor ?? '#000000'
                }
                : shape
        ));
        setEditingShapeId(null);
    }, [textInput, fontFeatures.fontSize, fontFeatures.fontFamily, fontFeatures.fontStyles, fontFeatures.alignment, fontFeatures.listType, fontFeatures.textColor, onShapesChange, setEditingShapeId]);

    useEffect(() => {
        if (typeof document === 'undefined') return;

        const canvases = document.querySelectorAll<HTMLCanvasElement>(".drawing-panel");
        const cleanupFunctions: (() => void)[] = [];

        canvases.forEach((canvas) => {
            const handleMouseDown = (e: MouseEvent) => {
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                const mouseX = (e.clientX - rect.left) * scaleX;
                const mouseY = (e.clientY - rect.top) * scaleY;

                let clickedOnText = false;
                for (const shape of shapes) {
                    if (shape.type === "text") {
                        if (mouseX >= shape.x && mouseX <= shape.x + shape.width &&
                            mouseY >= shape.y && mouseY <= shape.y + shape.height) {
                            clickedOnText = true;

                            onShapesChange(prev => prev.map(s =>
                                s.id === shape.id
                                    ? {
                                        ...s,
                                        isEditing: true,
                                        selected: true,
                                        borderType: s.borderType ?? 'solid',
                                        borderSize: s.borderSize ?? 1,
                                        borderColor: s.borderColor ?? '#000000'
                                    }
                                    : { ...s, isEditing: false, selected: false }
                            ));
                            setTextInput(shape.text || "");
                            setEditingShapeId(shape.id);

                            break; 
                        }
                    }
                }

                if (!clickedOnText) {
                    if (!textActive) {
                        return;
                    }

                    // Create new text shape 
                    const panelId = canvas.getAttribute("data-panel-id") || "default";
                    const newShape: Shape = {
                        id: `text-${Date.now()}-${Math.random()}`,
                        type: "text",
                        x: mouseX,
                        y: mouseY,
                        width: Math.max(200, MIN_SHAPE_WIDTH),
                        height: Math.max(60, MIN_SHAPE_HEIGHT),
                        selected: true,
                        panelId: panelId,
                        text: "",
                        fontSize: fontFeatures.fontSize,
                        fontFamily: fontFeatures.fontFamily,
                        textColor: fontFeatures.textColor,
                        fontStyles: fontFeatures.fontStyles,
                        textAlignment: fontFeatures.alignment,
                        listType: fontFeatures.listType,
                        isEditing: true,
                        borderType: 'solid',
                        borderSize: 1,
                        borderColor: '#000000'
                    };

                    onShapesChange(prev => [...prev.map(s => ({ ...s, selected: false })), newShape]);
                    setTextInput("");
                    setEditingShapeId(newShape.id);

                    if (typeof onTextToggle === 'function') {
                        onTextToggle(false);
                    }
                }
            };

            canvas.addEventListener("mousedown", handleMouseDown);
            cleanupFunctions.push(() => {
                canvas.removeEventListener("mousedown", handleMouseDown);
            });
        });

        return () => cleanupFunctions.forEach(fn => fn());
    }, [textActive, shapes, onShapesChange, setTextInput, setEditingShapeId,
        fontFeatures.fontSize, fontFeatures.fontFamily, fontFeatures.fontStyles,
        fontFeatures.alignment, fontFeatures.listType, fontFeatures.textColor, onTextToggle]);

    useEffect(() => {
        if (typeof document === 'undefined') return;

        const handleOutsideMouseDown = (e: MouseEvent) => {
            const editingShape = shapes.find(s => s.isEditing && s.type === 'text' && s.id === editingShapeId);
            if (!editingShape) return;

            const canvas = document.querySelector<HTMLCanvasElement>(`.drawing-panel[data-panel-id="${editingShape.panelId || 'default'}"]`);
            if (!canvas) {
                commitEditing(editingShape.id);
                return;
            }

            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const clickX = (e.clientX - rect.left) * scaleX;
            const clickY = (e.clientY - rect.top) * scaleY;

            const clickedInsideShape =
                clickX >= editingShape.x && clickX <= editingShape.x + editingShape.width &&
                clickY >= editingShape.y && clickY <= editingShape.y + editingShape.height &&
                e.target && (e.target as HTMLElement).closest('.drawing-panel');

            if (!clickedInsideShape) {
                commitEditing(editingShape.id);
            }
        };

        window.addEventListener('mousedown', handleOutsideMouseDown);
        return () => window.removeEventListener('mousedown', handleOutsideMouseDown);
    }, [shapes, editingShapeId, commitEditing]);

    useEffect(() => {
        if (!editingShapeId) return;
        const editingShape = shapes.find(s => s.id === editingShapeId);
        if (!editingShape) return;
        if (!editingShape.selected) {
            commitEditing(editingShapeId);
        }
    }, [shapes, editingShapeId, textInput, commitEditing]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const editingShape = shapes.find(shape => shape.isEditing && shape.type === "text" && shape.selected && shape.id === editingShapeId);

            if (!editingShape) return;

            if (e.key === "Escape" || e.key === "Enter") {
                e.preventDefault();
                commitEditing(editingShape.id);
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
    }, [shapes, textInput, setTextInput, editingShapeId, commitEditing]);

    useEffect(() => {
        if (!editingShapeId) return;
        if (typeof document === 'undefined') return;

        const editingShape = shapes.find(s => s.id === editingShapeId);
        let canvasToFocus: HTMLCanvasElement | null = null;
        if (editingShape) {
            canvasToFocus = document.querySelector<HTMLCanvasElement>(`.drawing-panel[data-panel-id="${editingShape.panelId || 'default'}"]`);
        }
        if (!canvasToFocus) {
            canvasToFocus = document.querySelector<HTMLCanvasElement>(".drawing-panel");
        }
        if (canvasToFocus) {
            canvasToFocus.focus();
        }
    }, [editingShapeId, shapes]);

    useEffect(() => {
        if (!editingShapeId) return;

        const interval = setInterval(() => {
            onShapesChange(prev => [...prev]);
        }, 500);

        return () => clearInterval(interval);
    }, [editingShapeId, onShapesChange]);
};