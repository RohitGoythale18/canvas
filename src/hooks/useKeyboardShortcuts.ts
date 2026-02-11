import { UseKeyboardShortcutsProps } from '@/types';
import { useEffect, useRef } from 'react';

export const useKeyboardShortcuts = ({
    shapes,
    onShapesChange,
    permission,
    onUndo,
    onRedo,
    yShapes
}: UseKeyboardShortcutsProps) => {
    const shapesRef = useRef(shapes);
    const onUndoRef = useRef(onUndo);
    const onRedoRef = useRef(onRedo);
    const canEditRef = useRef(permission === 'OWNER' || permission === 'WRITE');

    useEffect(() => {
        shapesRef.current = shapes;
        onUndoRef.current = onUndo;
        onRedoRef.current = onRedo;
        canEditRef.current = permission === 'OWNER' || permission === 'WRITE';
    }, [shapes, onUndo, onRedo, permission]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // If editing a text shape, ignore global shortcuts
            const hasEditingText = shapesRef.current.some(shape => shape.isEditing && shape.type === "text");
            if (hasEditingText) return;

            const canEdit = canEditRef.current;

            // Delete -> delete selected shapes
            if (e.key === "Delete") {
                if (!canEdit) return;

                const selectedShapes = shapesRef.current.filter(s => s.selected);
                if (yShapes) {
                    selectedShapes.forEach(s => yShapes.delete(s.id));
                } else {
                    onShapesChange(prev => prev.filter(shape => !shape.selected));
                }
                return;
            }

            // Check if e.key exists before trying to use it
            if (!e.key) return;

            const key = e.key.toLowerCase();
            const meta = e.ctrlKey || e.metaKey;

            // Undo (Ctrl/Cmd + Z)
            if (meta && key === 'z' && !e.shiftKey) {
                if (!canEdit) return;
                e.preventDefault();
                onUndoRef.current?.();
                return;
            }

            // Redo (Ctrl/Cmd + Y) OR (Ctrl/Cmd + Shift + Z)
            if (meta && (key === 'y' || (key === 'z' && e.shiftKey))) {
                if (!canEdit) return;
                e.preventDefault();
                onRedoRef.current?.();
                return;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onShapesChange]);
};