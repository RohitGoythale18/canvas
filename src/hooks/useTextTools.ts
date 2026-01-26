'use client';
import { Command, FontStyles, Shape, UseTextToolsProps } from '@/types';
import { useEffect, useCallback, useRef } from 'react';

const MIN_SHAPE_WIDTH = 20;
const MIN_SHAPE_HEIGHT = 20;

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

class AddTextShapeCommand implements Command {
    constructor(
        private shape: Shape,
        private setShapes: React.Dispatch<React.SetStateAction<Shape[]>>
    ) { }

    execute() {
        this.setShapes(prev => [...prev.map(s => ({ ...s, selected: false })), this.shape]);
    }

    undo() {
        this.setShapes(prev => prev.filter(s => s.id !== this.shape.id));
    }
}

class EditTextCommand implements Command {
    constructor(
        private shapeId: string,
        private before: Shape,
        private after: Shape,
        private setShapes: React.Dispatch<React.SetStateAction<Shape[]>>
    ) { }

    execute() {
        this.setShapes(prev =>
            prev.map(s => (s.id === this.shapeId ? this.after : s))
        );
    }

    undo() {
        this.setShapes(prev =>
            prev.map(s => (s.id === this.shapeId ? this.before : s))
        );
    }
}

export const useTextTools = ({
    executeCommand,
    textActive,
    shapes,
    textInput,
    editingShapeId,
    currentFontFeatures,
    onShapesChange,
    setTextInput,
    setEditingShapeId,
    onTextToggle,
    permission,
    canvasRefs
}: UseTextToolsProps) => {
    const fontFeatures = currentFontFeatures ?? DEFAULT_FONT_FEATURES;
    const canEdit = permission === 'OWNER' || permission === 'WRITE';
    const beforeEditRef = useRef<Shape | null>(null);

    const commitEditing = useCallback((id: string | null) => {
        if (!id || !canEdit) return;

        const before = beforeEditRef.current;
        const after = shapes.find(s => s.id === id);
        if (!before || !after) return;

        executeCommand(
            new EditTextCommand(
                id,
                before,
                {
                    ...after,
                    isEditing: false,
                    selected: true,
                    text: textInput,
                    fontSize: fontFeatures.fontSize,
                    fontFamily: fontFeatures.fontFamily,
                    textColor: fontFeatures.textColor,
                    fontStyles: fontFeatures.fontStyles,
                    textAlignment: fontFeatures.alignment,
                    listType: fontFeatures.listType,
                },
                onShapesChange
            )
        );

        setEditingShapeId(null);
        beforeEditRef.current = null;
    }, [executeCommand, textInput, shapes, fontFeatures.fontSize, fontFeatures.fontFamily, fontFeatures.fontStyles, fontFeatures.alignment, fontFeatures.listType, fontFeatures.textColor, onShapesChange, setEditingShapeId, canEdit]);

    useEffect(() => {
        const canvases = Object.entries(canvasRefs.current).filter(
            ([, canvas]) => canvas !== null
        ) as [string, HTMLCanvasElement][];
        const cleanupFunctions: (() => void)[] = [];

        canvases.forEach(([panelId, canvas]) => {
            const handleDblClick = (e: MouseEvent) => {
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                const x = (e.clientX - rect.left) * scaleX;
                const y = (e.clientY - rect.top) * scaleY;

                const clickedText = shapes.find(
                    s =>
                        s.type === 'text' &&
                        x >= s.x &&
                        x <= s.x + s.width &&
                        y >= s.y &&
                        y <= s.y + s.height
                );

                if (clickedText && canEdit) {
                    beforeEditRef.current = { ...clickedText };

                    onShapesChange(prev =>
                        prev.map(s =>
                            s.id === clickedText.id
                                ? { ...s, isEditing: true, selected: true }
                                : { ...s, isEditing: false, selected: false }
                        )
                    );

                    setTextInput(clickedText.text || '');
                    setEditingShapeId(clickedText.id);
                }
            };

            const handleMouseDown = (e: MouseEvent) => {
                if (!textActive || !canEdit) return;

                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                const x = (e.clientX - rect.left) * scaleX;
                const y = (e.clientY - rect.top) * scaleY;

                // Check if we clicked on ANY existing shape
                const clickedShape = shapes.find(
                    s =>
                        s.panelId === panelId &&
                        x >= s.x &&
                        x <= s.x + s.width &&
                        y >= s.y &&
                        y <= s.y + s.height
                );

                // If we clicked an existing shape, don't create a new text box
                // let useShapeInteraction handle selection/dragging
                if (clickedShape) return;

                const maxZ = Math.max(0, ...shapes.filter(s => s.panelId === panelId).map(s => s.zIndex ?? 0));

                const newShape: Shape = {
                    id: `text-${Date.now()}-${Math.random()}`,
                    type: 'text',
                    x,
                    y,
                    width: Math.max(200, MIN_SHAPE_WIDTH),
                    height: Math.max(60, MIN_SHAPE_HEIGHT),
                    selected: true,
                    panelId,
                    text: '',
                    fontSize: fontFeatures.fontSize,
                    fontFamily: fontFeatures.fontFamily,
                    textColor: fontFeatures.textColor,
                    fontStyles: fontFeatures.fontStyles,
                    textAlignment: fontFeatures.alignment,
                    listType: fontFeatures.listType,
                    isEditing: true,
                    borderType: 'solid',
                    borderSize: 1,
                    borderColor: '#000000',
                    zIndex: maxZ + 1,
                };

                executeCommand(
                    new AddTextShapeCommand(newShape, onShapesChange)
                );

                setTextInput('');
                setEditingShapeId(newShape.id);
                onTextToggle?.(false);
            };

            canvas.addEventListener("mousedown", handleMouseDown);
            canvas.addEventListener("dblclick", handleDblClick);
            cleanupFunctions.push(() => {
                canvas.removeEventListener("mousedown", handleMouseDown);
                canvas.removeEventListener("dblclick", handleDblClick);
            });
        });

        return () => cleanupFunctions.forEach(fn => fn());
    }, [executeCommand, textActive, shapes, onShapesChange, setTextInput, setEditingShapeId, fontFeatures.fontSize, fontFeatures.fontFamily, fontFeatures.fontStyles, fontFeatures.alignment, fontFeatures.listType, fontFeatures.textColor, onTextToggle, canEdit, permission, canvasRefs]);

    useEffect(() => {
        if (typeof document === 'undefined') return;

        const handleOutsideMouseDown = (e: MouseEvent) => {
            const editingShape = shapes.find(s => s.isEditing && s.type === 'text' && s.id === editingShapeId);
            if (!editingShape || !canEdit) return;

            const canvas = canvasRefs.current[editingShape.panelId || 'default'];
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

            if (!clickedInsideShape && canEdit) {
                commitEditing(editingShape.id);
            }
        };

        window.addEventListener('mousedown', handleOutsideMouseDown);
        return () => window.removeEventListener('mousedown', handleOutsideMouseDown);
    }, [shapes, editingShapeId, commitEditing, canEdit, permission, canvasRefs]);

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

            if (!editingShape || !canEdit) return;

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
    }, [shapes, textInput, setTextInput, editingShapeId, commitEditing, canEdit, permission]);

    useEffect(() => {
        if (!editingShapeId) return;
        if (typeof document === 'undefined') return;

        const editingShape = shapes.find(s => s.id === editingShapeId);
        let canvasToFocus: HTMLCanvasElement | null = null;
        if (editingShape) {
            canvasToFocus = canvasRefs.current[editingShape.panelId || 'default'];
        }
        if (!canvasToFocus) {
            canvasToFocus = canvasRefs.current['default'] || Object.values(canvasRefs.current)[0];
        }
        if (canvasToFocus) {
            canvasToFocus.focus();
        }
    }, [editingShapeId, shapes, canEdit, permission]);

    useEffect(() => {
        if (!editingShapeId) return;

        const interval = setInterval(() => {
            onShapesChange(prev => [...prev]);
        }, 500);

        return () => clearInterval(interval);
    }, [editingShapeId, onShapesChange]);
};